const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { keccak256, hexlify } = ethers.utils;

describe("Challenges", function () {
  let Challenges;
  let challenges;
  let owner;
  let addr1;
  let startBit;
  let challengeLength;

  beforeEach(async function () {
    Challenges = await ethers.getContractFactory("Challenges");
    [owner, addr1] = await ethers.getSigners();
    challenges = await Challenges.deploy();
    challenges.on("log", (s, v) => {
        console.log(v.args)
    })
    challenges.on("log2", (s, v) => {
        console.log(v.args)
    })
    challenges.on("log3", (s, v) => {
        console.log(v.args)
    })
    startBit = Number(await challenges.getStartBit());
    challengeLength = Number(await challenges.getBitRange());
  });

  it("Should create a challenge with 35 sub-challenges for a specified recipient", async function () {
    const challengeText = "Solve the puzzle";
    const subChallenges = Array(challengeLength).fill().map((_, i) => ethers.keccak256(ethers.getBytes("0x123456")));
    
    await expect(challenges.createChallenge(addr1.address, challengeText, subChallenges))
      .to.emit(challenges, "ChallengeCreated")
      .withArgs(0, addr1.address, challengeText);

    const challenge = await challenges.getChallenge(0);
    expect(challenge[0]).to.equal(addr1.address);
    expect(challenge[1]).to.equal(challengeText);
    expect(challenge[2].length).to.equal(challengeLength);
    expect(challenge[3].length).to.equal(challengeLength);
    expect(challenge[4]).to.equal(false);
  });

  it("Should allow the specified recipient to submit multiple sub-solutions at once in hex format", async function () {
    const challengeText = "Solve the puzzle";
    const subChallenges = Array(challengeLength).fill().map((_, i) => ethers.keccak256(ethers.getBytes("0x123456")));
    const subSolution = (i) => "123456"; // Remove 0x prefix

    await challenges.createChallenge(addr1.address, challengeText, subChallenges);

    const solutions = [subSolution(0), subSolution(1), subSolution(2)];

    await expect(challenges.connect(addr1).solveChallenge(0, solutions))
      .to.emit(challenges, "SubChallengeSolved")
      .and.to.emit(challenges, "SubChallengeSolved")
      .and.to.emit(challenges, "SubChallengeSolved")

    const challenge = await challenges.getChallenge(0);


    for (let i = 0; i < solutions.length; i++) {
      expect(challenge[3][i]).to.equal(`${"123456"}`);
    }
    expect(challenge[4]).to.equal(false); // Challenge should not be fully solved yet
  });

  it("Should not allow the specified recipient to submit solutions beyond block limit", async function () {
    const challengeText = "Solve the puzzle";
    const subChallenges = Array(challengeLength).fill().map((_, i) => ethers.keccak256(ethers.getBytes("0x123456")));
    const subSolution = (i) => "123456"; // Remove 0x prefix

    await challenges.createChallenge(addr1.address, challengeText, subChallenges);

    // Move forward by 40 blocks
    for (let i = 0; i < 40; i++) {
      await ethers.provider.send("evm_mine", []);
    }

    const solutions = [subSolution(0), subSolution(1), subSolution(2)];

    await expect(challenges.connect(addr1).solveChallenge(0, solutions))
      .to.be.revertedWith("Solutions can only be reported before block time limit")
  });

  it("Should verify the challenge and mark it as solved if all solutions are correct", async function () {
    const challengeText = "Solve the puzzle";
    const subChallenges = Array(challengeLength).fill().map((_, i) => ethers.sha256(ethers.getBytes("0x123456")));
    const subSolution = (i) => "123456"; // Remove 0x prefix

    await challenges.createChallenge(addr1.address, challengeText, subChallenges);

    const solutions = Array.from({ length: challengeLength }, (_, i) => subSolution(i));

    await challenges.connect(addr1).solveChallenge(0, solutions);

    await expect(challenges.verifyChallenge(0))
      .to.emit(challenges, "ChallengeVerified")
      .withArgs(0, challengeLength);

    const challenge = await challenges.getChallenge(0);
    expect(challenge[4]).to.equal(true); // Challenge should be marked as solved
  });

  it("Should not verify the challenge if any solution is incorrect", async function () {
    const challengeText = "Solve the puzzle";
    const subChallenges = Array(challengeLength).fill().map((_, i) => ethers.sha256(ethers.getBytes(`0x666666`)));
    const subSolution = (i) => "123456";

    await challenges.createChallenge(addr1.address, challengeText, subChallenges);

    const solutions = Array.from({ length: challengeLength }, (_, i) => subSolution(i));
    solutions[0] = "123456"; // Introduce an incorrect solution

    await challenges.connect(addr1).solveChallenge(0, solutions);

    await expect(challenges.verifyChallenge(0))
      .to.emit(challenges, "ChallengeVerified")
      .withArgs(0, 0);

    const challenge = await challenges.getChallenge(0);
    expect(challenge[4]).to.equal(false); // Challenge should not be marked as solved
  });

  it("Should not allow a non-recipient to submit sub-solutions", async function () {
    const challengeText = "Solve the puzzle";
    const subChallenges = Array(challengeLength).fill().map((_, i) => ethers.keccak256(ethers.toUtf8Bytes(`Sub-challenge ${i}`)));
    const subSolution = (i) => `Sub-challenge ${i}`;

    await challenges.createChallenge(addr1.address, challengeText, subChallenges);

    const solutions = [subSolution(0)];

    await expect(challenges.solveChallenge(0, solutions))
      .to.be.revertedWith("Only the recipient can solve this challenge.");
  });

  it("Should not allow solving a non-existent challenge", async function () {
    const solutions = ["Solution"];

    await expect(challenges.solveChallenge(0, solutions))
      .to.be.revertedWith("Challenge does not exist.");
  });
});
