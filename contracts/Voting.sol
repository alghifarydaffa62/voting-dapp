// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Voting {
    enum VotingState { Pending, Active, Closed }
    VotingState public state;
    address public admin;
    
    struct Voter {
        uint votedCandidate;
        string name;
        bool hasVoted;   
        bool isRegistered;
    }

    struct Candidate {
        uint candidateID;
        string name;
        uint totalVote;
    }

    mapping(address => Voter) public voters;
    mapping(address => Candidate) public candidates;

    address[] public candidateAddresses;

    constructor() {
        admin = msg.sender;
        state = VotingState.Pending;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "Only Admin!");
        _;
    }

    event registerVoterSuccess(address indexed admin, address indexed voter, string name);
    event registerCandidateSuccess(address indexed admin, address indexed candidate, string name);
    event castVoteSuccess(address indexed voter, uint indexed candidateVoted);
    event VotingStarted(address indexed admin);
    event VotingEnded(address indexed admin);

    function registerVoter(address _voterAdd, string memory _name) external onlyAdmin {
        require(state == VotingState.Pending, "Vote already start!");
        require(!voters[_voterAdd].isRegistered, "Voter already registered!");
        require(_voterAdd != address(0), "Address invalid!");

        voters[_voterAdd] = Voter({
            votedCandidate: 0,
            name: _name,
            hasVoted: false,
            isRegistered: true
        });

        emit registerVoterSuccess(msg.sender, _voterAdd, _name);
    }

    function registerCandidate(address _candidateAdd, string memory _name) external onlyAdmin {
        require(state == VotingState.Pending, "Vote already start!");
        require(bytes(candidates[_candidateAdd].name).length == 0, "Candidate already registered!");
        require(!voters[_candidateAdd].isRegistered, "Voter cannot be a candidate!");
        require(_candidateAdd != address(0), "Address invalid!");

        uint newID = candidateAddresses.length;
        candidates[_candidateAdd] = Candidate({
            candidateID: newID,
            name: _name,
            totalVote: 0
        });

        candidateAddresses.push(_candidateAdd);

        emit registerCandidateSuccess(msg.sender, _candidateAdd, _name);
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

    function startVoting() external onlyAdmin {
        require(state == VotingState.Pending, "Voting already started or closed!");
        state = VotingState.Active;

        emit VotingStarted(msg.sender);
    }

    function closeVoting() external onlyAdmin {
        require(state == VotingState.Active, "Voting not active!");
        state = VotingState.Closed;
        emit VotingEnded(msg.sender);
    }

    function showProgress() external view returns(uint[] memory, uint[] memory) {
        uint totalCandidates = candidateAddresses.length;
        uint[] memory candidateIds = new uint[](totalCandidates);
        uint[] memory total = new uint[](totalCandidates);

        for(uint i = 0; i < totalCandidates; i++) {
            address candidateAddr = candidateAddresses[i];
            candidateIds[i] = candidates[candidateAddr].candidateID;
            total[i] = candidates[candidateAddr].totalVote;
        } 

        return (candidateIds, total);
    }

    function showResult() external view returns (uint[] memory, string[] memory, uint[] memory) {
        require(state == VotingState.Closed, "Voting not closed yet!");
        
        uint totalCandidates = candidateAddresses.length;
        uint[] memory candidateIds = new uint[](totalCandidates);
        string[] memory candidateNames = new string[](totalCandidates);
        uint[] memory votes = new uint[](totalCandidates);

        for(uint i = 0; i < totalCandidates; i++) {
            address candidateAddr = candidateAddresses[i];
            candidateIds[i] = candidates[candidateAddr].candidateID;
            candidateNames[i] = candidates[candidateAddr].name;
            votes[i] = candidates[candidateAddr].totalVote;
        }

        return (candidateIds, candidateNames, votes);
    }
}