const { ethers } = require("hardhat");

async function main() {
  const contractAddress = '0x9Ac04b4F02147c522Ea1daFa721a57eEeb2A5480';
  const contractABI = require('/var/www/EtherVerifierSystem/smart-contracts/artifacts/contracts/GroupAssignment.sol/GroupAssignment.json').abi;

  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a');

  const privateKey = '0x2c02bc078bc2f0702f1bbbd1e32d56e3ad8fcc317bc83c1856e34f0528f437a8';
  const wallet = new ethers.Wallet(privateKey, provider);

  // Connect to the contract
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // Request random number
  try {
    console.log('Requesting random number...');
    const tx = await contract.requestRandomWords({
      gasLimit: 2000000,  // Set a manual gas limit
    });
    console.log('Transaction hash:', tx.hash);
    await tx.wait();
    console.log('Transaction confirmed.');
  } catch (error) {
    console.error('Error requesting random number:', error);
    return;
  }

  // Delay function to wait for VRF response
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Retrieve the random number with retries
  for (let i = 0; i < 2; i++) { // retry 10 times
    try {
      const latestRequestId = await contract.lastRequestId();
      console.log('Latest request ID:', latestRequestId.toString());
      const request = await contract.s_requests(latestRequestId);
      console.log('Request:', request);
      if (!request.fulfilled) {
        throw new Error('Random number request not yet fulfilled');
      }
      console.log('Random number:', request.randomWords[0].toString());
      return; // exit after successful retrieval
    } catch (error) {
      console.error('Attempt', i + 1, 'Error retrieving random number:', error.message);
      await delay(60000); // wait for 30 seconds before retrying
    }
  }

  console.error('Failed to retrieve random number after multiple attempts');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
