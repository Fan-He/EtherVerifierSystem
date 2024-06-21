const {Web3} = require('web3');
const { abi } = require('/var/www/EtherVerifierSystem/smart-contracts/artifacts/contracts/GroupAssignment.sol/SubscriptionConsumer.json'); // ABI of the compiled contract

const web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a');
const contractAddress = '0xf0D54f316415de39b49aB01b0D2ae1999C727d0f';
const contract = new web3.eth.Contract(abi, contractAddress);

const requestRandomNumber = async (account) => {
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
    console.log('Transaction receipt:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error requesting random number:', error);
    throw new Error('Error requesting random number');
  }
};

const getRandomNumber = async () => {
  try {
    const latestRequestId = await contract.methods.lastRequestId().call();
    const request = await contract.methods.s_requests(latestRequestId).call();
    if (!request.fulfilled) {
      throw new Error('Random number request not yet fulfilled');
    }
    return request.randomWords[0];
  } catch (error) {
    console.error('Error getting random number:', error);
    throw new Error('Error getting random number');
  }
};

module.exports = {
  requestRandomNumber,
  getRandomNumber,
};