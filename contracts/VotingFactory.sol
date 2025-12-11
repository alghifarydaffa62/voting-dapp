// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import './Voting.sol';

contract VotingFactory {
    address[] public deployedVotings;

    event VotingCreated(address indexed contractAddress, address indexed deployer, string metadataURI);

    function createVoting(string memory _metadataURI) external {
        Voting newVoting = new Voting(_metadataURI);

        newVoting.transferOwnership(msg.sender);

        deployedVotings.push(address(newVoting));

        emit VotingCreated(address(newVoting), msg.sender, _metadataURI);
    }

    function getDeployedVotings() external view returns(address[] memory) {
        return deployedVotings;
    }
}