const {Web3} = require('web3');
const { abi } = require('/var/www/EtherVerifierSystem/smart-contracts/artifacts/contracts/GroupAssignment.sol/SubscriptionConsumer.json'); // ABI of the compiled contract
const RandomRequest = require('../models/RandomRequest'); 

const web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a');
const contractAddress = '0xf0D54f316415de39b49aB01b0D2ae1999C727d0f';
const contract = new web3.eth.Contract(abi, contractAddress);

const requestRandomNumber = async (account) => {
  console.log("-------request random number from vrfIntegration--------------");
  try {
    const tx = contract.methods.requestRandomWords();
    const gas = await tx.estimateGas({ from: account });
    const gasPrice = await web3.eth.getGasPrice();

    const data = tx.encodeABI();
    const txData = {
      from: account,
      to: contract.options.address,
      data: data,
      gas,
      gasPrice,
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, process.env.PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const requestId = await contract.methods.lastRequestId().call();

    // Store the request ID in the database
    const randomRequest = new RandomRequest({ requestId });
    await randomRequest.save();

    console.log('Transaction receipt:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error requesting random number:', error);
    throw new Error('Error requesting random number');
  }
};

const checkRequestFulfillment = async () => {
  console.log("-------check request fulfillment from vrfIntegration--------------")
  const requests = await RandomRequest.find({ fulfilled: false });

  for (const request of requests) {
    const events = await contract.getPastEvents('RequestFulfilled', {
      filter: { requestId: request.requestId },
      fromBlock: 0,
      toBlock: 'latest'
    });

    if (events.length > 0) {
      const randomNumber = events[0].returnValues.randomWords[0].toString(); // Convert BigInt to string
      await RandomRequest.findOneAndUpdate({ requestId: request.requestId }, { randomNumber, fulfilled: true });
      console.log(`Request ${request.requestId} fulfilled with random number ${randomNumber}`);
    }
  }
};

const getLatestRandomNumber = async () => {
  console.log("-------get latest unused number from vrfIntegration--------------")
  const latestRequest = await RandomRequest.findOne({ used: false }).sort({ timestamp: 1 });
  return latestRequest ? latestRequest.randomNumber : null;
};

module.exports = {
  requestRandomNumber,
  checkRequestFulfillment,
  getLatestRandomNumber,
};