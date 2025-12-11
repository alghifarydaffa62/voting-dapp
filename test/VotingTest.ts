import { expect } from "chai";
import type { Contract, Signer } from "ethers";
import { network } from "hardhat";
 
const { ethers } = await network.connect();

describe("Voting Testing", function () {
  let Voting: any;
  let voting: Contract;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  let now: number;
  let futureTime: number;

  async function getLatestTime(): Promise<number> {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    if (!block) throw new Error("Block not found");
    return block.timestamp;
  }

  async function increaseTime(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  beforeEach(async () => {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();
    voting = await Voting.deploy("ipfs://QmDummyHash123");
  })

  async function startVotingHelper() {
    now = await getLatestTime()
    futureTime = now + 3600

    await voting.startVoting(futureTime)
  }

  describe("deployment", () => {
    it("Happy Path: Should set the right metadataURI", async () => {
      expect(await voting.metadataURI()).to.equal("ipfs://QmDummyHash123")
    })

    it("Happy Path: Should have votingEndTime as 0", async () => {
      expect(await voting.votingEndTime()).to.equal(0)
    })
  })

  describe("registerVoter", () => {
    it("Happy Path: should register a voter successfully", async () => {
      await voting.registerVoter(await addr1.getAddress());
      const voterData = await voting.voters(await addr1.getAddress());
      expect(voterData.isRegistered).to.be.true;
    });

    it("Sad Path: Should REVERT if trying to register the same voter twice", async () => {
      await voting.registerVoter(await addr1.getAddress());

      await expect(
        voting.registerVoter(await addr1.getAddress())
      ).to.be.revertedWith("Invalid address or already registered!");
    });

    it("Sad Path: Should REVERT if non-owner tries to register a voter", async () => {
      await expect(
        voting.connect(addr1).registerVoter(await addr2.getAddress())
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
    
    it("Sad Path: Should REVERT if trying to register the zero address", async () => {
      await expect(
        voting.registerVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address or already registered!");
    })

    it("Sad Path: Should REVERT if owner tries to register after voting has started", async () => {
      await startVotingHelper();

      await expect(
        voting.registerVoter(await addr1.getAddress())
      ).to.be.revertedWith("Voting has already started!");
    })
  });

  describe("RegisterCandidate", () => {
    it("Happy Path: should register a candidate successfully", async () => {
      await voting.registerCandidate(await addr1.getAddress());

      const candidateData = await voting.candidates(await addr1.getAddress());
      expect(candidateData.isRegistered).to.be.true;
    })

    it("Sad Path: Should REVERT if trying to register the same candidate twice", async () => {
      await voting.registerCandidate(await addr1.getAddress());

      await expect(
        voting.registerCandidate(await addr1.getAddress())
      ).to.be.revertedWith("Candidate already registered!");
    })

    it("Sad Path: Should REVERT if non-owner tries to register a candidate", async () => {
      await expect(
        voting.connect(addr1).registerCandidate(await addr2.getAddress())
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    })

    it("Sad Path: Should REVERT if trying to register a voter as a candidate", async () => {
      await voting.registerVoter(await addr1.getAddress());

      await expect(
        voting.registerCandidate(await addr1.getAddress())
      ).to.be.revertedWith("Voter cannot be a candidate!");
    })

    it("Sad Path: Should REVERT if trying to register the zero address", async () => {
      await expect(
        voting.registerCandidate(ethers.ZeroAddress)
      ).to.be.revertedWith("Address invalid!");
    })

    it("Sad Path: Should REVERT if owner tries to register candidate after voting has started", async () => {
      await startVotingHelper();

      await expect(
        voting.registerCandidate(await addr1.getAddress())
      ).to.be.revertedWith("Voting has already started!");
    })
  })
  
  describe("Cast Voting", () => {
    
    it("Happy Path: Should cast a vote successfully", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();
      
      await voting.connect(addr1).castVote(0);

      const candidateData = await voting.candidates(await addr2.getAddress());
      expect(candidateData.totalVote).to.equal(1);

      const voterData = await voting.voters(await addr1.getAddress());
      expect(voterData.hasVoted).to.be.true;
      expect(voterData.votedCandidate).to.equal(0);
    })

    it("Sad Path: Should REVERT if unregistered voter tries to cast a vote", async () => {
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("You are not registered!");
    })

    it("Sad Path: Should REVERT if voter tries to vote when voting has not started", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("Voting has not started yet!");
    })

    it("Sad Path: Should REVERT if voter tries to vote when voting has ended", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();

      await increaseTime(4000)

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("Voting has ended!");
    })

    it("Sad Path: Should REVERT if voter tries to vote twice", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();

      await voting.connect(addr1).castVote(0);

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("You already vote!");
    })

    it("Sad Path: Should REVERT if voter tries to vote for unregistered candidate", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await startVotingHelper();

      await expect(
        voting.connect(addr1).castVote(99)
      ).to.be.revertedWith("Invalid ID!");
    })
  })

  describe("start voting", () => {
    it("Happy Path: shoud start voting successfully", async () => {
      const now = await getLatestTime()
      const endTime = now + 3600;

      await voting.startVoting(endTime);
      
      expect(await voting.isVotingStarted()).to.be.true;
      expect(await voting.votingEndTime()).to.equal(endTime);
    })

    it("Sad Path: Should REVERT if non-owner tries to start voting", async () => {
      const now = await getLatestTime()
      await expect(
        voting.connect(addr1).startVoting(now + 3600)
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    })

    it("Sad Path: Should REVERT owner trying to start voting twice", async () => {
      await startVotingHelper();
      const now = await getLatestTime()
      const endTime = now + 3600;

      await expect(
        voting.startVoting(endTime)
      ).to.be.revertedWith("Voting has already started!");
    })
  })

  describe("Show Result", () => {
    it("Happy Path: Pagination should work", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();

      await increaseTime(4000);

      const [candidateIds, votes] = await voting.showResult(0, 1);
      expect(candidateIds.length).to.equal(1);
      expect(candidateIds[0]).to.equal(0);

      const [candidateIds2, votes2] = await voting.showResult(1, 1);
      expect(candidateIds2.length).to.equal(1);
      expect(candidateIds2[0]).to.equal(1);
    })

    it("Sad Path: Should REVERT if show result called before voting is start", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());

      await expect(
        voting.showResult(0, 1)
      ).to.be.revertedWith("Voting has not started yet!");
    })

    it("Sad Path: Should REVERT if show result called before voting is closed", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();

      await expect(
        voting.showResult(0, 1)
      ).to.be.revertedWith("voting is still ongoing!");
    })

    it("Sad Path: Should REVERT if limit pagination are zero", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();
      await increaseTime(4000)

      await expect(
        voting.showResult(0, 0)
      ).to.be.revertedWith("Limit must be greater than zero!");
    })
  })

  describe("Show Progress", () => {
    it("Happy Path: Should show progress successfully", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();

      const [candidateIDs, votes] = await voting.showProgress(0, 1);
      expect(candidateIDs.length).to.equal(1);
      expect(candidateIDs[0]).to.equal(0);
      expect(votes[0]).to.equal(0);

      const [candidateIDs2, votes2] = await voting.showProgress(1, 1);
      expect(candidateIDs2.length).to.equal(1);
      expect(candidateIDs2[0]).to.equal(1);
      expect(votes2[0]).to.equal(0);
    })

    it("Sad Path: Should REVERT if show progress called before voting is start", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());

      await expect(
        voting.showProgress(0, 1)
      ).to.be.revertedWith("Voting has not started yet!");
    })

    it("Sad Path: Should REVERT if show progress called when voting is closed", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();
      await increaseTime(4000)

      await expect(
        voting.showProgress(0, 1)
      ).to.be.revertedWith("Voting has ended!");
    })

    it("Sad Path: Should REVERT if limit pagination are zero", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await startVotingHelper();
      
      await expect(
        voting.showProgress(0, 0)
      ).to.be.revertedWith("Limit must be greater than zero!");
    })
  })
});