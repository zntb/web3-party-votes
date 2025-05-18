/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import hre from 'hardhat';
import { Votoken } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const { ethers } = hre;

describe('Votoken Contract', function () {
  let votoken: Votoken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
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

    it('Should set the correct owner', async function () {
      expect(await votoken.owner()).to.equal(owner.address);
    });
  });

  describe('Minting', function () {
    it('Should allow a user to mint one token', async function () {
      await votoken.connect(user1).mint();

      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN);
      expect(await votoken.hasAlreadyMinted(user1.address)).to.be.true;
    });

    it('Should prevent a user from minting more than once', async function () {
      // First mint should succeed
      await votoken.connect(user1).mint();

      // Second mint should fail with the new error name
      await expect(votoken.connect(user1).mint()).to.be.revertedWithCustomError(
        votoken,
        'MintAlreadyMinted',
      );
    });

    it('Should allow different users to mint tokens', async function () {
      await votoken.connect(user1).mint();
      await votoken.connect(user2).mint();

      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);
      expect(await votoken.balanceOf(user2.address)).to.equal(ONE_TOKEN);
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN * BigInt(2));
      expect(await votoken.hasAlreadyMinted(user1.address)).to.be.true;
      expect(await votoken.hasAlreadyMinted(user2.address)).to.be.true;
    });

    it('Should correctly update total supply after minting', async function () {
      // Initial supply should be 0
      expect(await votoken.totalSupply()).to.equal(0);

      // Mint for user1
      await votoken.connect(user1).mint();
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN);

      // Mint for user2
      await votoken.connect(user2).mint();
      expect(await votoken.totalSupply()).to.equal(ONE_TOKEN * BigInt(2));
    });

    it('Should correctly track hasMinted status', async function () {
      // Initially, no one has minted
      expect(await votoken.hasAlreadyMinted(user1.address)).to.be.false;
      expect(await votoken.hasAlreadyMinted(user2.address)).to.be.false;

      // User1 mints
      await votoken.connect(user1).mint();
      expect(await votoken.hasAlreadyMinted(user1.address)).to.be.true;
      expect(await votoken.hasAlreadyMinted(user2.address)).to.be.false;

      // User2 mints
      await votoken.connect(user2).mint();
      expect(await votoken.hasAlreadyMinted(user1.address)).to.be.true;
      expect(await votoken.hasAlreadyMinted(user2.address)).to.be.true;
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

    it('Should handle self-transfers (which are still blocked)', async function () {
      await expect(
        votoken.connect(user1).transfer(user1.address, ONE_TOKEN),
      ).to.be.revertedWith('This token cannot be transferred');
    });
  });

  describe('Edge Cases', function () {
    it('Should handle minting to the same account from different transactions', async function () {
      await votoken.connect(user1).mint();

      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);

      // Attempt to mint again - should fail with new error name
      await expect(votoken.connect(user1).mint()).to.be.revertedWithCustomError(
        votoken,
        'MintAlreadyMinted',
      );

      // Balance should still be just one token
      expect(await votoken.balanceOf(user1.address)).to.equal(ONE_TOKEN);
    });

    it('Should prevent minting after already minting in same block', async function () {
      // User1 mints
      await votoken.connect(user1).mint();

      // User1 tries to mint again - should fail
      await expect(votoken.connect(user1).mint()).to.be.revertedWithCustomError(
        votoken,
        'MintAlreadyMinted',
      );

      // User2 should still be able to mint
      await votoken.connect(user2).mint();
      expect(await votoken.balanceOf(user2.address)).to.equal(ONE_TOKEN);
    });

    it('Should handle owner minting like any other user', async function () {
      // Owner can mint once
      await votoken.connect(owner).mint();
      expect(await votoken.balanceOf(owner.address)).to.equal(ONE_TOKEN);
      expect(await votoken.hasAlreadyMinted(owner.address)).to.be.true;

      // Owner cannot mint twice
      await expect(votoken.connect(owner).mint()).to.be.revertedWithCustomError(
        votoken,
        'MintAlreadyMinted',
      );
    });
  });

  describe('Token Details', function () {
    it('Should have 18 decimals as per ERC20 standard', async function () {
      expect(await votoken.decimals()).to.equal(18);
    });

    it('Should maintain correct token metadata', async function () {
      expect(await votoken.name()).to.equal('Votoken');
      expect(await votoken.symbol()).to.equal('VTK');
      expect(await votoken.decimals()).to.equal(18);
    });
  });

  describe('Contract State', function () {
    it('Should correctly track multiple users minting status', async function () {
      const signers = await ethers.getSigners();
      const testUsers = signers.slice(0, 5); // Use first 5 signers

      // Initially no one has minted
      for (const user of testUsers) {
        expect(await votoken.hasAlreadyMinted(user.address)).to.be.false;
      }

      // Each user mints
      for (let i = 0; i < testUsers.length; i++) {
        await votoken.connect(testUsers[i]).mint();
        expect(await votoken.balanceOf(testUsers[i].address)).to.equal(
          ONE_TOKEN,
        );
        expect(await votoken.hasAlreadyMinted(testUsers[i].address)).to.be.true;
        expect(await votoken.totalSupply()).to.equal(ONE_TOKEN * BigInt(i + 1));
      }

      // Verify all have minted
      for (const user of testUsers) {
        expect(await votoken.hasAlreadyMinted(user.address)).to.be.true;
        expect(await votoken.balanceOf(user.address)).to.equal(ONE_TOKEN);
      }
    });
  });
});
