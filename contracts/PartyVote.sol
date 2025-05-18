// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITokenContract {
    function balanceOf(address account) external view returns (uint256);
}

error vote__noToken();
error vote__doneVoting();
error vote__noParty();

contract PartyVote is Ownable {
    ITokenContract private token;

    struct Party {
        string name;
        uint256 count;
    }

    struct VoteInfo {
        uint256 partyIndex; // Save index instead of full struct
        bool hasVoted;
        uint256 time;
    }

    mapping(address => VoteInfo) private votes;
    uint256 public totalVoteUsed;
    Party[] private parties;

    event PartyAdded(string name, uint256 index);
    event Voted(address indexed voter, string party, uint256 time);

    constructor(string memory name, address tokenAddress) Ownable(msg.sender) {
        token = ITokenContract(tokenAddress);
        parties.push(Party(name, 0));
        emit PartyAdded(name, 0);
    }

    function addParty(string memory name) public onlyOwner {
        parties.push(Party(name, 0));
        emit PartyAdded(name, parties.length - 1);
    }

    function getParties() public view returns (Party[] memory) {
        return parties;
    }

    function vote(string memory name) public {
        if (token.balanceOf(msg.sender) < 1) {
            revert vote__noToken();
        }

        if (votes[msg.sender].hasVoted) {
            revert vote__doneVoting();
        }

        for (uint256 i = 0; i < parties.length; i++) {
            if (keccak256(bytes(parties[i].name)) == keccak256(bytes(name))) {
                parties[i].count += 1;
                votes[msg.sender] = VoteInfo({partyIndex: i, hasVoted: true, time: block.timestamp});
                totalVoteUsed++;
                emit Voted(msg.sender, name, block.timestamp);
                return;
            }
        }

        revert vote__noParty();
    }

    function getVotes(address voter) public view returns (string memory name, bool hasVoted, uint256 time) {
        VoteInfo memory v = votes[voter];
        if (!v.hasVoted) return ("", false, 0);
        return (parties[v.partyIndex].name, true, v.time);
    }
}
