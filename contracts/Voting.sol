// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Voting is Ownable {
    enum VotingState { Pending, Active, Closed }
    VotingState public state;
    
    struct Voter {
        uint votedCandidate;
        bool hasVoted;   
        bool isRegistered;
    }

    struct Candidate {
        uint candidateID;
        uint totalVote;
        bool isRegistered;
    }

    mapping(address => Voter) public voters;
    mapping(address => Candidate) public candidates;

    address[] public candidateAddresses;

    constructor() Ownable(msg.sender) {
        state = VotingState.Pending;
    }


    event registerVoterSuccess(address indexed admin, address indexed voter);
    event registerCandidateSuccess(address indexed admin, address indexed candidate);
    event castVoteSuccess(address indexed voter, uint indexed candidateVoted);
    event VotingStarted(address indexed admin);
    event VotingEnded(address indexed admin);

    function registerVoter(address _voterAdd) external onlyOwner {
        require(state == VotingState.Pending, "Vote already start!");
        require(!voters[_voterAdd].isRegistered, "Voter already registered!");
        require(_voterAdd != address(0), "Address invalid!");

        voters[_voterAdd] = Voter({
            votedCandidate: 0,
            hasVoted: false,
            isRegistered: true
        });

        emit registerVoterSuccess(msg.sender, _voterAdd);
    }

    function registerCandidate(address _candidateAdd) external onlyOwner {
        require(state == VotingState.Pending, "Vote already start!");
        require(!candidates[_candidateAdd].isRegistered, "Candidate already registered!");
        require(!voters[_candidateAdd].isRegistered, "Voter cannot be a candidate!");
        require(_candidateAdd != address(0), "Address invalid!");

        uint newID = candidateAddresses.length;
        candidates[_candidateAdd] = Candidate({
            candidateID: newID,
            totalVote: 0,
            isRegistered: true
        });

        candidateAddresses.push(_candidateAdd);

        emit registerCandidateSuccess(msg.sender, _candidateAdd);
    }

    function castVote(uint candidateId) external {
        require(voters[msg.sender].isRegistered, "You are not registered!");
        require(state == VotingState.Active, "Voting not active!");
        require(!voters[msg.sender].hasVoted, "You already vote!");
        require(candidateId < candidateAddresses.length, "Invalid ID!");

        address votedAddr = candidateAddresses[candidateId];
        candidates[votedAddr].totalVote++;
        voters[msg.sender].votedCandidate = candidateId;
        voters[msg.sender].hasVoted = true;

        emit castVoteSuccess(msg.sender, candidateId);
    }

    function startVoting() external onlyOwner {
        require(state == VotingState.Pending, "Voting already started or closed!");
        state = VotingState.Active;

        emit VotingStarted(msg.sender);
    }

    function closeVoting() external onlyOwner {
        require(state == VotingState.Active, "Voting not active!");
        state = VotingState.Closed;
        emit VotingEnded(msg.sender);
    }

    function showProgress(uint _offset, uint _limit) external view returns(uint[] memory, uint[] memory) {
        require(_limit > 0, "Limit must be greater than zero!");
        require(state == VotingState.Active, "Voting not active!");

        uint totalCandidates = candidateAddresses.length;
        uint endIndex = _offset + _limit;

        if(endIndex > totalCandidates) {
            endIndex = totalCandidates;
        }

        uint actualSize = endIndex - _offset;
        uint[] memory candidateIds = new uint[](actualSize);
        uint[] memory total = new uint[](actualSize);

        uint j = 0;
        for(uint i = _offset; i < endIndex; i++) {
            address candidateAddr = candidateAddresses[i];
            candidateIds[j] = candidates[candidateAddr].candidateID;
            total[j] = candidates[candidateAddr].totalVote;

            j++;
        } 

        return (candidateIds, total);
    }

    function showResult(uint _offset, uint _limit) external view returns (uint[] memory, uint[] memory) {
        require(_limit > 0, "Limit must be greater than zero!");
        require(state == VotingState.Closed, "Voting not closed yet!");
        
        uint totalCandidates = candidateAddresses.length;
        uint endIndex = _offset + _limit;

        if(endIndex > totalCandidates) {
            endIndex = totalCandidates;
        }

        uint actualSize = endIndex - _offset;
        uint[] memory candidateIds = new uint[](actualSize);
        uint[] memory votes = new uint[](actualSize);

        uint j = 0;
        
        for(uint i = _offset; i < endIndex; i++) {
            address candidateAddr = candidateAddresses[i];
            candidateIds[j] = candidates[candidateAddr].candidateID;
            votes[j] = candidates[candidateAddr].totalVote;

            j++;
        }

        return (candidateIds, votes);
    }
}