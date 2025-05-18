/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import hre from 'hardhat';
import { PartyVote, MockTokenContract } from '../typechain-types';
import { Signer } from 'ethers';

const { ethers } = hre;

describe('PartyVote Contract', function () {
  let partyVote: PartyVote;
  let mockToken: MockTokenContract;
  let owner: Signer;
  let voter1: Signer;
  let voter2: Signer;
  let voter3: Signer;
  let ownerAddress: string;
  const initialPartyName = 'Party A';

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    // Deploy Mock Token
    const MockTokenFactory = await ethers.getContractFactory(
      'MockTokenContract',
    );
    mockToken = (await MockTokenFactory.deploy()) as MockTokenContract;
    await mockToken.waitForDeployment();

    await mockToken.setBalance(ownerAddress, ethers.parseEther('10'));
    await mockToken.setBalance(
      await voter1.getAddress(),
      ethers.parseEther('5'),
    );
    await mockToken.setBalance(
      await voter2.getAddress(),
      ethers.parseEther('2'),
    );
    // voter3 has no tokens

    // Deploy PartyVote
    const PartyVoteFactory = await ethers.getContractFactory('PartyVote');
    partyVote = (await PartyVoteFactory.deploy(
      initialPartyName,
      await mockToken.getAddress(),
    )) as PartyVote;
    await partyVote.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await partyVote.owner()).to.equal(ownerAddress);
    });

    it('Should initialize with the correct party', async function () {
      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(1);
      expect(parties[0].name).to.equal(initialPartyName);
      expect(parties[0].count).to.equal(0);
    });

    it('Should initialize with zero total votes used', async function () {
      expect(await partyVote.totalVoteUsed()).to.equal(0);
    });
  });

  describe('Party Management', function () {
    it('Should allow owner to add a new party', async function () {
      await partyVote.addParty('Party B');
      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(2);
      expect(parties[1].name).to.equal('Party B');
    });

    it('Should not allow non-owner to add a new party', async function () {
      await expect(
        partyVote.connect(voter1).addParty('Party C'),
      ).to.be.revertedWithCustomError(partyVote, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Voting', function () {
    beforeEach(async function () {
      await partyVote.addParty('Party B');
    });

    it('Should allow a token holder to vote', async function () {
      await partyVote.connect(voter1).vote(initialPartyName);

      const [partyName, hasVoted, time] = await partyVote.getVotes(
        await voter1.getAddress(),
      );
      expect(hasVoted).to.be.true;
      expect(partyName).to.equal(initialPartyName);
      expect(time).to.be.gt(0);

      const parties = await partyVote.getParties();
      expect(parties[0].count).to.equal(1);
      expect(await partyVote.totalVoteUsed()).to.equal(1);
    });

    it('Should allow voting for different parties', async function () {
      await partyVote.connect(voter1).vote(initialPartyName);
      await partyVote.connect(voter2).vote('Party B');
      const parties = await partyVote.getParties();
      expect(parties[0].count).to.equal(1);
      expect(parties[1].count).to.equal(1);
      expect(await partyVote.totalVoteUsed()).to.equal(2);
    });

    it('Should not allow voting twice', async function () {
      await partyVote.connect(voter1).vote(initialPartyName);
      await expect(
        partyVote.connect(voter1).vote('Party B'),
      ).to.be.revertedWithCustomError(partyVote, 'vote__doneVoting');
    });

    it('Should not allow voting with no tokens', async function () {
      await expect(
        partyVote.connect(voter3).vote(initialPartyName),
      ).to.be.revertedWithCustomError(partyVote, 'vote__noToken');
    });

    it('Should not allow voting for non-existent party', async function () {
      await expect(
        partyVote.connect(voter1).vote('Non-existent Party'),
      ).to.be.revertedWithCustomError(partyVote, 'vote__noParty');
    });
  });

  describe('Vote Querying', function () {
    it('Should return empty vote info for non-voters', async function () {
      const [, hasVoted, time] = await partyVote.getVotes(
        await voter1.getAddress(),
      );
      expect(hasVoted).to.be.false;
      expect(time).to.equal(0);
    });

    it('Should return correct vote info after voting', async function () {
      await partyVote.connect(voter1).vote(initialPartyName);
      const [partyName, hasVoted, time] = await partyVote.getVotes(
        await voter1.getAddress(),
      );
      expect(hasVoted).to.be.true;
      expect(partyName).to.equal(initialPartyName);
      expect(time).to.be.gt(0);
    });
  });

  describe('Edge Cases', function () {
    it('Should handle case sensitivity in party names', async function () {
      await partyVote.addParty('party a');

      await partyVote.connect(voter1).vote(initialPartyName);
      await partyVote.connect(voter2).vote('party a');

      const parties = await partyVote.getParties();
      expect(parties[0].count).to.equal(1);
      expect(parties[1].count).to.equal(1);
    });

    it('Should handle adding parties with the same name', async function () {
      await partyVote.addParty(initialPartyName);
      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(2);
      expect(parties[0].name).to.equal(initialPartyName);
      expect(parties[1].name).to.equal(initialPartyName);

      await partyVote.connect(voter1).vote(initialPartyName);
      const updatedParties = await partyVote.getParties();
      expect(updatedParties[0].count).to.equal(1);
      expect(updatedParties[1].count).to.equal(0);
    });
  });
});
