import { expect } from "chai";
import type { Contract, Signer } from "ethers";
import { network } from "hardhat";
 
const { ethers } = await network.connect();

describe("VotingFactory Testing", function () {
    let VotingFactory: any;
    let votingFactory: Contract;
    let owner: Signer;
    let addr1: Signer;

    beforeEach(async () => {
    // Kita hanya perlu deploy Factory-nya saja di awal
    VotingFactory = await ethers.getContractFactory("VotingFactory");
    [owner, addr1] = await ethers.getSigners();
    votingFactory = await VotingFactory.deploy();
  });

  it("Happy Path: Should create a new Voting contract", async () => {
    const tx = await votingFactory.connect(addr1).createVoting("ipfs://QmHash123");
    await tx.wait();

    const deployedVotings = await votingFactory.getDeployedVotings();
    expect(deployedVotings.length).to.equal(1);

    const newVotingAddress = deployedVotings[0];
    const votingContract = await ethers.getContractAt("Voting", newVotingAddress);

    expect(await votingContract.metadataURI()).to.equal("ipfs://QmHash123");
    expect(await votingContract.owner()).to.equal(await addr1.getAddress());
  });

  it("Happy Path: Should track multiple votings", async () => {
    await votingFactory.createVoting("ipfs://1");
    await votingFactory.createVoting("ipfs://2");

    const deployedVotings = await votingFactory.getDeployedVotings();
    expect(deployedVotings.length).to.equal(2);
  });
})