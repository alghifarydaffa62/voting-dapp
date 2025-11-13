import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { network } from "hardhat";
 
const { ethers } = await network.connect();

describe("Voting Testing", function () {
  let Voting: any;
  let voting: Contract;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async () => {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();
    voting = await Voting.deploy();
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
      ).to.be.revertedWith("Voter already registered!");
    });

    it("Sad Path: Should REVERT if non-owner tries to register a voter", async () => {
      await expect(
        voting.connect(addr1).registerVoter(await addr2.getAddress())
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    });
    
    it("Sad Path: Should REVERT if trying to register the zero address", async () => {
      await expect(
        voting.registerVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Address invalid!");
    })

    it("Sad Path: Should REVERT if owner tries to register after voting has started", async () => {
      await voting.startVoting();

      await expect(
        voting.registerVoter(await addr1.getAddress())
      ).to.be.revertedWith("Vote already start!");
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
      await voting.startVoting();

      await expect(
        voting.registerCandidate(await addr1.getAddress())
      ).to.be.revertedWith("Vote already start!");
    })
  })
  
  describe("Cast Voting", () => {
    it("Happy Path: Should cast a vote successfully", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();
      
      await voting.connect(addr1).castVote(0);

      const candidateData = await voting.candidates(await addr2.getAddress());
      expect(candidateData.totalVote).to.equal(1);

      const voterData = await voting.voters(await addr1.getAddress());
      expect(voterData.hasVoted).to.be.true;
      expect(voterData.votedCandidate).to.equal(0);
    })

    it("Sad Path: Should REVERT if unregistered voter tries to cast a vote", async () => {
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("You are not registered!");
    })

    it("Sad Path: Should REVERT if voter tries to vote when voting has not started", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("Voting not active!");
    })

    it("Sad Path: Should REVERT if voter tries to vote when voting has ended", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();
      await voting.closeVoting();

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("Voting not active!");
    })

    it("Sad Path: Should REVERT if voter tries to vote twice", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();

      await voting.connect(addr1).castVote(0);

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("You already vote!");
    })

    it("Sad Path: Should REVERT if voter tries to vote for unregistered candidate", async () => {
      await voting.registerVoter(await addr1.getAddress());
      await voting.startVoting();

      await expect(
        voting.connect(addr1).castVote(0)
      ).to.be.revertedWith("Invalid ID!");
    })
  })

  describe("start voting", () => {
    it("Happy Path: shoud start voting successfully", async () => {
      await voting.startVoting();
      expect(await voting.state()).to.equal(1);
    })

    it("Sad Path: Should REVERT if non-owner tries to start voting", async () => {
      await expect(
        voting.connect(addr1).startVoting()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    })

    it("Sad Path: Should REVERT owner trying to start voting twice", async () => {
      await voting.startVoting();
      
      await expect(
        voting.startVoting()
      ).to.be.revertedWith("Voting already started or closed!");
    })
  })

  describe("Close Voting", () => {
    it("Happy Path: Should be able to close voting successfully", async () => {
      await voting.startVoting();
      await voting.closeVoting();

      expect(await voting.state()).to.equal(2);
    })

    it("Sad Path: Should REVERT if non-owner tries to close voting", async () => {
      await voting.startVoting();

      await expect(
        voting.connect(addr1).closeVoting()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
    })

    it("Sad Path: Should REVERT if owner tries to close voting before it starts", async () => {
      await expect(
        voting.closeVoting()
      ).to.be.revertedWith("Voting not active!");
    })

    it("Sad Path: Should REVERT if owner tries to close voting twice", async () => {
      await voting.startVoting();
      await voting.closeVoting();

      await expect(
        voting.closeVoting()
      ).to.be.revertedWith("Voting not active!");
    })
  })

  describe("Show Result", () => {
    it("Happy Path: Pagination should work", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();
      await voting.closeVoting();

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
      ).to.be.revertedWith("Voting not closed yet!");
    })

    it("Sad Path: Should REVERT if show result called before voting is closed", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();

      await expect(
        voting.showResult(0, 1)
      ).to.be.revertedWith("Voting not closed yet!");
    })

    it("Sad Path: Should REVERT if limit pagination are zero", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();
      await voting.closeVoting();

      await expect(
        voting.showResult(0, 0)
      ).to.be.revertedWith("Limit must be greater than zero!");
    })
  })

  describe("Show Progress", () => {
    it("Happy Path: Should show progress successfully", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();

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
      ).to.be.revertedWith("Voting not active!");
    })

    it("Sad Path: Should REVERT if show progress called when voting is closed", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();
      await voting.closeVoting();

      await expect(
        voting.showProgress(0, 1)
      ).to.be.revertedWith("Voting not active!");
    })

    it("Sad Path: Should REVERT if limit pagination are zero", async () => {
      await voting.registerCandidate(await addr1.getAddress());
      await voting.registerCandidate(await addr2.getAddress());
      await voting.startVoting();

      await expect(
        voting.showProgress(0, 0)
      ).to.be.revertedWith("Limit must be greater than zero!");
    })
  })
});