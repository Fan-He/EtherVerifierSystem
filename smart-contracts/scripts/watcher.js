const { ethers } = require("ethers");
const { exec } = require('child_process');
const path = require('node:path');

const START_BIT = 30;
const TIME_LIMIT_MINUTES = 6;

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/23c63b26fcff4e0fb77385bba99cd812");

const contractAddress = "0xF42a164E2E53e338c7b8988cf30fDE43FFF86393";
const wallet = new ethers.Wallet("308543f21ec90307bd4e393953698f9a4c6110625ad947f77fcf49a5e203c370", provider);
const contractABI = [
  "function solveChallenge(uint _challengeIndex, string[] memory _subSolutions) public",
]

const remoteAddress = '0xed534FD3D6F50622068f58e9c014aE26C5e98d36';
const remotecontractABI = [  // ABI of the deployed contract
  "event ChallengeCreated(address indexed recipient, string challengeText, bytes32[] groupHashArray, uint indexed challengeId)",
  "function createChallenge(address _recipient, string memory _challengeText, bytes32[] memory _subChallenges) public",
  "event ChallengeSubmitted(uint indexed challengeId, uint solved)"
]

const contract = new ethers.Contract(remoteAddress, contractABI, wallet)
const remoteContract = new ethers.Contract(remoteAddress, remotecontractABI, provider);

// Listen for the event
remoteContract.on("ChallengeSubmitted", async (challengeId, solved, event) => {
  console.log(`Submission Event detected:`);
  console.log(`challengeId: ${challengeId}`);
  console.log(`solved: ${solved}`);
  console.log(`event: ${event.log}`);
})
let countDownActive = true
remoteContract.on("ChallengeCreated", async (recipient, challengeText, hashes, id, event) => {
  try {
    console.log(`Challenge Event detected:`);
    console.log(`recipient: ${recipient}`);
    console.log(`challengeText: ${challengeText}`);
    console.log(`hashes: ${hashes}`);
    console.log(`id: ${id}`);
    const result = [];
    countDownActive = true;
    breakHash(START_BIT, hashes, result);
    
    setTimeout(async () => {
      countDownActive = false;
      console.log(result)
      const tx = await contract.solveChallenge(id, result)

      console.log("Transaction:", tx);
    
      // Wait for the transaction to be confirmed
      const receipt = await tx.wait();
      console.log(receipt);

    }, TIME_LIMIT_MINUTES*60*1000)

  } catch (error) {
    console.error("Error calling function:", error);
  }
});


async function test1() {
  const tx = await contract.solveChallenge(1, [ '0001deaa', '628237ff', 'c9734f09', '', '' ])

  console.log("Transaction hash:", tx.hash);

  // Wait for the transaction to be confirmed
  const receipt = await tx.wait();
  console.log("Transaction confirmed.");

}

function test() {
  const result = [];
  const hashes = [
    '0x5590d225794541d80a8d430c9a1baf3183fe265e83bdcfb07aa68bfae28237ff', // 0001deaa, 30
    '0x1edea9a713cc9766e4da4e1eb70a4b39cfa4a02f9bbd781a68396874c9734f09', // 628237ff, 31
    '0x0744b04924ed66bcae43e486e2a39baa47590cb9acf05a850786d71a7625ebdb', // c9734f09, 32
    '0x3c95b04808c3b3ce7d8bc9ba0c7f56c50d66b05172c717decd630660abe493a1', // 17625ebdb, 33
    '0x7ea8b0082d78f1753531e7001ac14c4cdf38923eb50b537d93763a736c2a6b6d','0xecb283a13a208e6e91e16432dd87b56ebc3daaa284953c2940c626208c140cb8','0x3a4dd49c90d16a15c33d8d3d7b6ec2b074724b82d2916ab862933e34c0c318c7','0x204b8b48ccc737ba537c2f6c8115cbceb3880cef683883ea238cf2a0f4d5f11f','0xd3061dd05e70b638bdf1fb7b4a280e5b6f912c1e09404e3e4cff5c3ccb3fa9ec','0x91a831a143514d2415dc300484ca770f62211c1b9648adf0c9ff33ae8f456c1e','0x1bd8ca4bb496599753950d7842ec6ad4bf5fad43d9de637b58d5c563ae65aece9b0aa2adf8ca7419ec554930','0x1c0791c2e8e16830ab2cc22ea175780a0df8b67c86ec6f24b7378938ca1cb7f8','0x43d0556bbb3084b864e6e20728967915aa3816d9909ab21006afd0aa028695b8','0x03070648070d8bb9dcb483278db19a46107b08c9ed599712fd006ac06194db08','0x1166582ffcf50af4fc81fa421280b6813e8222e1de4c1cd0c9c187031f4edfaa','0x278d9c7c48aca038ef15ced42ba8f583bdc0e8f8400e2c9ec90aa34b94663f77','0x6c58d671166d617dbd9ba235ebd0544665f888debb060caaeb2a95ad1f1b3e7f','0x5d37c9fdd86ec0bd961d432297dda404d9004153fe12991c7d807d8ba75c537f','0xf81e632f340efe586ed3188decfc7d2bd6d52127a406c8d3e12e5616225c19a2','0xc8ca180c478c25bbcf39884fdb7977090695a3d18441531ad1703c853aa66b9b','0xff7ba6d148afc089e8da2aef59fa4df9b8d3cd1650534a6b53a22a0a7db62119','0x587c39e2bb0920edc3adcf3a6739f92aeb6f731ac30ca640442a716bc492e3ff','0x5102ab256bb9af4baa3688b93e86e3556ec0b797ba552bc214f36df48c48dcf9','0x17c5d998f56d26de88e1001dae711b68393194085a9c6962ee34f9b515733d01','0xefc1345f1eccbf738004ddcc63972ec7033bb76085aaeaf227381a21d2c5813d','0x8dfa66441048807bbd5bc271456415cfb0920e223890abe4186492417197fa87','0x40932f48601d72f2292dffc70f1e6b53d3f8e3e919636c214a5d5222db63a4e1','0xa53a3f4d16e0c61131b41e0e1cd3504addf0b48b3ec8102f60396ed93e795af6','0x1bd9f1e9a6b0d6fa346d1c9c33f965945b09a69563ca58beef3057b70ec6d6b8','0xf72f0c283a882ce8e6c38c25aab0dbc4e8234a1ff9737880f615268d86753933','0x45aaa02504bb65a5c5c8770a68a95051ce7305a8d3ac597ac8a63c94ec53d3bf']
  countDownActive = true;
  breakHash(START_BIT, hashes, result);
  
  setTimeout(() => {
    countDownActive = false;
    console.log(result)
  }, TIME_LIMIT_MINUTES*60*1000)
}
function breakHash(bit, hashes, result) {
  if(!countDownActive) {
    return
  }
  const target = (hashes[bit - START_BIT]).slice(2)
  spawnProcess(joinPath("..", "..", "main.exe ") + bit + " " + target)
  .then((output) => {

    if (output.length % 2 == 1) {
      output = '0' + output;
    }
    console.log(output)
    result.push(output)

    breakHash(bit+1, hashes, result)
  })
}
const joinPath = (...args) => {
  return path.join(__dirname, ...args);
}

const spawnProcess = (path) => {
  console.log(path)

  return new Promise((resolve, reject) => {
    exec(path, (error, stdout, stderr) => {
      if (error) {
        console.log(error)
        return reject(error. message);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      resolve(stdout); 
    });
  })

}
// test();

console.log(`Listening for events at address ${remoteAddress}`);
