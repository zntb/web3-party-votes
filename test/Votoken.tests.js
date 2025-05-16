const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Votoken Contract', function () {
  let votoken;
  let owner;
  let user1;
  let user2;
  const ONE_TOKEN = ethers.parseEther('1.0'); // 1 token with 18 decimals

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy the Votoken contract
    const Votoken = await ethers.getContractFactory('Votoken');
    votoken = await Votoken.deploy();
    await votoken.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct token name and symbol', async function () {
      expect(await votoken.name()).to.equal('Votoken');
      expect(await votoken.symbol()).to.equal('VTK');
    });

    it('Should have 0 initial supply', async function () {
      expect(await votoken.totalSupply()).to.equal(0);
    });
  });

  describe('Minting', function () {
    it('Should allow a user to mint one token', async function () {
      await votoken.connect(user1).mint();

      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN);
    });

    it('Should prevent a user from minting more than once', async function () {
      // First mint should succeed
      await votoken.connect(user1).mint();

      // Second mint should fail
      await expect(votoken.connect(user1).mint()).to.be.revertedWithCustomError(
        votoken,
        'mint__gotToken',
      );
    });

    it('Should allow different users to mint tokens', async function () {
      await votoken.connect(user1).mint();
      await votoken.connect(user2).mint();

      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);
      expect(await votoken.balanceOf(user2.address)).to.equal(ONE_TOKEN);
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN * 2n);
    });

    it('Should correctly update total supply after minting', async function () {
      // Initial supply should be 0
      expect(await votoken.totalSupply()).to.equal(0);

      // Mint for user1
      await votoken.connect(user1).mint();
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN);

      // Mint for user2
      await votoken.connect(user2).mint();
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN * 2n);
    });
  });

  describe('Transfer Restrictions', function () {
    beforeEach(async function () {
      // Mint tokens for testing transfers
      await votoken.connect(user1).mint();
    });

    it('Should prevent token transfers', async function () {
      await expect(
        votoken.connect(user1).transfer(user2.address, ONE_TOKEN),
      ).to.be.revertedWith('This token cannot be transferred');
    });

    it('Should prevent transferFrom operations', async function () {
      await expect(
        votoken
          .connect(user1)
          .transferFrom(user1.address, user2.address, ONE_TOKEN),
      ).to.be.revertedWith('This token cannot be transferred');
    });

    it('Should prevent token approvals', async function () {
      await expect(
        votoken.connect(user1).approve(user2.address, ONE_TOKEN),
      ).to.be.revertedWith('Approval is not allowed for this token');
    });

    it('Should prevent transfers of smaller amounts', async function () {
      const smallAmount = ethers.parseEther('0.1'); // 0.1 token

      await expect(
        votoken.connect(user1).transfer(user2.address, smallAmount),
      ).to.be.revertedWith('This token cannot be transferred');
    });

    it('Should prevent transfers of zero amount', async function () {
      await expect(
        votoken.connect(user1).transfer(user2.address, 0),
      ).to.be.revertedWith('This token cannot be transferred');
    });
  });

  describe('Edge Cases', function () {
    it('Should handle minting to the same account from different transactions', async function () {
      await votoken.connect(user1).mint();

      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);

      // Attempt to mint again - should fail
      await expect(votoken.connect(user1).mint()).to.be.revertedWithCustomError(
        votoken,
        'mint__gotToken',
      );

      // Balance should still be just one token
      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);
    });

    it('Should handle self-transfers (which are still blocked)', async function () {
      await votoken.connect(user1).mint();

      await expect(
        votoken.connect(user1).transfer(user1.address, ONE_TOKEN),
      ).to.be.revertedWith('This token cannot be transferred');
    });

    it('Should correctly track hasMinted status', async function () {
      // User1 mints
      await votoken.connect(user1).mint();

      // User1 tries to mint again - should fail
      await expect(votoken.connect(user1).mint()).to.be.revertedWithCustomError(
        votoken,
        'mint__gotToken',
      );

      // User2 should still be able to mint
      await votoken.connect(user2).mint();
      expect(await votoken.balanceOf(user2.address)).to.equal(ONE_TOKEN);
    });
  });

  describe('Token Details', function () {
    it('Should have 18 decimals as per ERC20 standard', async function () {
      expect(await votoken.decimals()).to.equal(18);
    });
  });
});
