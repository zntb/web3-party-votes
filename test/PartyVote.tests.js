const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PartyVote Contract', function () {
  let partyVote;
  let mockToken;
  let owner;
  let voter1;
  let voter2;
  let voter3;
  const initialPartyName = 'Party A';

  beforeEach(async function () {
    // Get signers
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy mock token first
    const MockToken = await ethers.getContractFactory('MockTokenContract');
    mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();

    // Set some token balances for testing
    await mockToken.setBalance(owner.address, ethers.parseEther('10'));
    await mockToken.setBalance(voter1.address, ethers.parseEther('5'));
    await mockToken.setBalance(voter2.address, ethers.parseEther('2'));
    // Voter3 has 0 tokens for testing the no token error

    // Deploy the PartyVote contract
    const PartyVote = await ethers.getContractFactory('PartyVote');
    partyVote = await PartyVote.deploy(
      initialPartyName,
      await mockToken.getAddress(),
    );
    await partyVote.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await partyVote.owner()).to.equal(owner.address);
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
      expect(parties[1].count).to.equal(0);
    });

    it('Should not allow non-owner to add a new party', async function () {
      await expect(
        partyVote.connect(voter1).addParty('Party C'),
      ).to.be.revertedWithCustomError(partyVote, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Voting', function () {
    beforeEach(async function () {
      // Add another party for voting tests
      await partyVote.addParty('Party B');
    });

    it('Should allow a token holder to vote', async function () {
      await partyVote.connect(voter1).vote(initialPartyName);

      // Check if vote is recorded correctly
      const vote = await partyVote.getVotes(voter1.address);
      expect(vote.hasVoted).to.be.true;
      expect(vote.party.name).to.equal(initialPartyName);
      expect(vote.time).to.be.gt(0);

      // Check if party count is incremented
      const parties = await partyVote.getParties();
      expect(parties[0].count).to.equal(1);

      // Check if total votes is incremented
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
      const vote = await partyVote.getVotes(voter1.address);
      expect(vote.hasVoted).to.be.false;
      expect(vote.time).to.equal(0);
    });

    it('Should return correct vote info after voting', async function () {
      await partyVote.connect(voter1).vote(initialPartyName);

      const vote = await partyVote.getVotes(voter1.address);
      expect(vote.hasVoted).to.be.true;
      expect(vote.party.name).to.equal(initialPartyName);
      expect(vote.time).to.be.gt(0);
    });
  });

  describe('Edge Cases', function () {
    it('Should handle case sensitivity in party names', async function () {
      await partyVote.addParty('party a'); // Note the case difference from initialPartyName

      // Voter1 can vote for "Party A"
      await partyVote.connect(voter1).vote(initialPartyName);

      // Voter2 can vote for "party a" (different case)
      await partyVote.connect(voter2).vote('party a');

      const parties = await partyVote.getParties();
      // First party should have 1 vote
      expect(parties[0].count).to.equal(1);
      // Second party should have 1 vote
      expect(parties[1].count).to.equal(1);
    });

    it('Should handle adding parties with the same name', async function () {
      await partyVote.addParty(initialPartyName); // Same as the initial party

      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(2);
      expect(parties[0].name).to.equal(initialPartyName);
      expect(parties[1].name).to.equal(initialPartyName);

      // Vote for the first occurrence
      await partyVote.connect(voter1).vote(initialPartyName);

      const updatedParties = await partyVote.getParties();
      // First occurrence should get the vote since it's checked first in the loop
      expect(updatedParties[0].count).to.equal(1);
      expect(updatedParties[1].count).to.equal(0);
    });
  });
});

// Mock Token Contract for testing
