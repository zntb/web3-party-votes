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

    struct Votes {
        Party party;
        bool hasVoted;
        uint256 time;
    }

    mapping(address => Votes) private votes;
    uint256 public totalVoteUsed;
    Party[] private parties;

    constructor(string memory name, address tokenAddress) Ownable(msg.sender) {
        token = ITokenContract(tokenAddress);
        parties.push(Party(name, 0));
    }

    function addParty(string memory name) public onlyOwner {
        Party memory party = Party(name, 0);
        parties.push(party);
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
                votes[msg.sender] = Votes({party: parties[i], hasVoted: true, time: block.timestamp});
                totalVoteUsed++;
                return;
            }
        }
        revert vote__noParty();
    }

    function getVotes(address voter) public view returns (Votes memory) {
        return votes[voter];
    }
}
