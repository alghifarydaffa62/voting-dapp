// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Voting is Ownable {    
    string public metadataURI;
    uint public votingEndTime;
    bool public isVotingStarted;

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

    event registerVoterSuccess(address indexed admin, address indexed voter);
    event registerCandidateSuccess(address indexed admin, address indexed candidate);
    event castVoteSuccess(address indexed voter, uint indexed candidateVoted);
    event VotingStarted(address indexed admin);

    constructor(string memory _metadataURI) Ownable(msg.sender) {
        metadataURI = _metadataURI;
        isVotingStarted = false;
        votingEndTime = 0;
    }

    modifier onlyPending() {
        require(!isVotingStarted, "Voting has already started!");
        _;
    }

    modifier onlyActive() {
        require(isVotingStarted, "Voting has not started yet!");
        require(block.timestamp < votingEndTime, "Voting has ended!");
        _;
    }

    modifier onlyEnded() {
        require(isVotingStarted, "Voting has not started yet!");
        require(block.timestamp >= votingEndTime, "voting is still ongoing!");
        _;
    }

    function registerInternal(address _voter) private returns(bool) {
        if(_voter != address(0) || !voters[_voter].isRegistered) {
            return false;
        }

        voters[_voter] = Voter({
            votedCandidate: 0,
            hasVoted: false,
            isRegistered: true
        });
        emit registerVoterSuccess(msg.sender, _voter);
        return true;
    }

    function registerVoter(address _voter) external onlyOwner onlyPending {
        bool success = registerInternal(_voter);
        require(success, "Invalid address or already registered!");
    }

    function registerVoterBatch(address[] calldata _voters) external onlyOwner onlyPending {
        for(uint i = 0; i < _voters.length; i++) {
            registerInternal(_voters[i]);
        }
    }

    function registerCandidate(address _candidateAdd) external onlyOwner onlyPending {
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

    function startVoting(uint _votingEndTime) external onlyOwner onlyPending{
        require(_votingEndTime > block.timestamp, "Invalid duration!");

        isVotingStarted = true;
        votingEndTime = _votingEndTime;

        emit VotingStarted(msg.sender);
    }

    function castVote(uint candidateId) external onlyActive {
        require(voters[msg.sender].isRegistered, "You are not registered!");
        require(!voters[msg.sender].hasVoted, "You already vote!");
        require(candidateId < candidateAddresses.length, "Invalid ID!");

        address votedAddr = candidateAddresses[candidateId];
        candidates[votedAddr].totalVote++;
        voters[msg.sender].votedCandidate = candidateId;
        voters[msg.sender].hasVoted = true;

        emit castVoteSuccess(msg.sender, candidateId);
    }

    function getVotingStatus() external view returns(string memory) {
        if(!isVotingStarted) {
            return "Pending";
        }

        if(block.timestamp >= votingEndTime) {
            return "Closed";
        } else {
            return "Active";
        }
    }

    function getRemainingTime() external view returns (uint256) {
        if(!isVotingStarted || block.timestamp >= votingEndTime) {
            return 0;
        }

        return votingEndTime - block.timestamp;
    }

    function showProgress(uint _offset, uint _limit) external view onlyActive returns(uint[] memory, uint[] memory) {
        require(_limit > 0, "Limit must be greater than zero!");

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

    function showResult(uint _offset, uint _limit) external view onlyEnded returns (uint[] memory, uint[] memory) {
        require(_limit > 0, "Limit must be greater than zero!");
        
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