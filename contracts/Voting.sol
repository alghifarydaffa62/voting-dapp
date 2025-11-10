// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Voting {
    address public admin;
    bool voteStart;
    
    struct Voter {
        address voter;
        uint votedCandidate;
        bool hasVoted;   
        bool isRegistered;
    }

    struct Candidate {
        address candidateAddr;
        uint candidateID;
        uint totalVote;
        bool isCandidate;
    }

    uint public ID;
    mapping(address => Voter) public voters;
    mapping(address => Candidate) public candidates;

    Candidate[] public candidateList;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "Only Admin!");
        _;
    }

    event registerVoterSuccess(address indexed admin, address indexed voter);
    event registerCandidateSuccess(address indexed admin, address indexed candidate);
    event castVoteSuccess(address indexed voter, uint indexed candidateVoted);
    event VotingStarted(address indexed admin);
    event VotingEnded(address indexed admin);

    function registerVoter(address _voterAdd) external onlyAdmin {
        require(!voteStart, "Vote already start!");
        require(!voters[_voterAdd].isRegistered, "Voter already registered!");
        require(_voterAdd != address(0), "Address invalid!");

        voters[_voterAdd] = Voter({
            voter: _voterAdd,
            votedCandidate: 0,
            hasVoted: false,
            isRegistered: true
        });

        emit registerVoterSuccess(msg.sender, _voterAdd);
    }

    function registerCandidate(address _candidateAdd) external onlyAdmin {
        require(!voteStart, "Vote already start!");
        require(!candidates[_candidateAdd].isCandidate, "Candidate already registered!");
        require(!voters[_candidateAdd].isRegistered, "Voter cannot be a candidate!");
        require(_candidateAdd != address(0), "Address invalid!");

        uint newID = ID++;
        candidates[_candidateAdd] = Candidate({
            candidateAddr: _candidateAdd,
            candidateID: newID,
            totalVote: 0,
            isCandidate: true
        });

        candidateList.push(candidates[_candidateAdd]);

        emit registerCandidateSuccess(msg.sender, _candidateAdd);
    }

    function castVote(uint candidateId) external {
        require(voters[msg.sender].isRegistered, "You are not registered!");
        require(voteStart, "Vote not started!");
        require(!voters[msg.sender].hasVoted, "You already vote!");
        require(candidateId < candidateList.length, "Invalid ID!");

        address votedAddr = candidateList[candidateId].candidateAddr;
        candidates[votedAddr].totalVote++;
        voters[msg.sender].votedCandidate = candidateId;
        voters[msg.sender].hasVoted = true;

        emit castVoteSuccess(msg.sender, candidateId);
    }

    function startVoting() external onlyAdmin {
        require(!voteStart, "Voting has already started!");
        voteStart = true;

        emit VotingStarted(msg.sender);
    }

    function closeVoting() external onlyAdmin {
        require(voteStart, "Voting has not started yet!");
        voteStart = false;

        emit VotingEnded(msg.sender);
    }

    function showProgress() external view returns(uint[] memory, uint[] memory) {
        uint totalCandidates = candidateList.length;
        uint[] memory candidateIds = new uint[](totalCandidates);
        address[] memory candidatesAddr = new address[](totalCandidates);
        uint[] memory total = new uint[](totalCandidates);

        for(uint i = 0; i < totalCandidates; i++) {
            candidateIds[i] = candidateList[i].candidateID;
            candidatesAddr[i] = candidateList[i].candidateAddr;
            total[i] = candidates[candidatesAddr[i]].totalVote;
        } 

        return (candidateIds, total);
    }

    function showResult() external view returns (uint[] memory, address[] memory, uint[] memory) {
        require(!voteStart, "Vote still active!");
        
        uint totalCandidates = candidateList.length;
        uint[] memory candidateIds = new uint[](totalCandidates);
        address[] memory candidateAddr = new address[](totalCandidates);
        uint[] memory votes = new uint[](totalCandidates);

        for(uint i = 0; i < totalCandidates; i++) {
            candidateIds[i] = candidateList[i].candidateID;
            candidateAddr[i] = candidateList[i].candidateAddr;
            votes[i] = candidates[candidateAddr[i]].totalVote;
        }

        return (candidateIds, candidateAddr, votes);
    }
}
