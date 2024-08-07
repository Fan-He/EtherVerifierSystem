const { Common, Chain, Hardfork } = require('@ethereumjs/common');
const { LegacyTransaction } = require('@ethereumjs/tx');  // LegacyTransaction
const { Web3 } = require('web3');
const { bytesToHex } = require('@ethereumjs/util');

const web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a');

const { abi } = require('/var/www/EtherVerifierSystem/smart-contracts/artifacts/contracts/Challenges.sol/Challenges.json');
const contractAddress = "0xed534FD3D6F50622068f58e9c014aE26C5e98d36";

const contract = new web3.eth.Contract(abi, contractAddress);

const common = new Common({ chain: Chain.Sepolia, hardfork: Hardfork.London });

const storeGroupHash = async (from, privateKey, recipient, challengeText, groupHashArray) => {
  try {
    console.log("group hash in integration is: \n", groupHashArray);
    console.log("recipient: ", recipient);

    // Encode the data using ABI
    const data = contract.methods.createChallenge(recipient, challengeText, groupHashArray).encodeABI();

    const nonce = await web3.eth.getTransactionCount(from);

    // Fetch the gas price
    const gasPrice = await web3.eth.getGasPrice();

    const txData = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(3000000),
      to: contractAddress,
      value: '0x00',
      data: data,
      chainId: web3.utils.toHex(11155111)  // Sepolia testnet chain ID
    };

    console.log('Transaction Data:', txData);

    const tx = LegacyTransaction.fromTxData(txData, { common });
    const privateKeyWithoutPrefix = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const privateKeyBuffer = Buffer.from(privateKeyWithoutPrefix, 'hex');

    console.log('Private Key Buffer:', privateKeyBuffer);

    // Sign the transaction
    const signedTx = tx.sign(privateKeyBuffer);
    console.log("signedTx: ", signedTx);

    const serializedTx = signedTx.serialize();

    console.log("serializedTx: ", serializedTx);
    const raw = web3.utils.toHex(serializedTx);

    console.log('Serialized Transaction:', raw);
    console.log('Transaction Hash:', bytesToHex(signedTx.hash()));

    const receipt = await web3.eth.sendSignedTransaction(raw);
    console.log('Transaction Receipt:', receipt);

    return receipt;
    // return 0;


  } catch (error) {
    console.error('Error in storeGroupHash:', error);
    throw error;
  }
};

// const getChallengeDetails = async () => {
//   try {
//     const latestChallengeDetails = await contract.methods.getLatestChallengeDetails().call();
//     console.log('Latest Challenge Details:', latestChallengeDetails);
        
//     const [retrievedRecipient, retrievedSubChallenges] = latestChallengeDetails;

//     console.log('Recipient:', retrievedRecipient);
//     console.log('SubChallenges:', retrievedSubChallenges);
//   } catch (error) {
//     console.error('Error in getChallengeDetails:', error);
//     throw error;
//   }
// };

// // Listen to the GroupHashStored event
// contract.events.GroupHashStored({}, (error, event) => {
//   if (error) {
//     console.error('Error in event listener:', error);
//   } else {
//     console.log('GroupHashStored event:', event);
//   }
// });

// const getStoredGroupHash = async (recipient) => {
//   try {
//     const storedGroupHash = await contract.methods.getGroupHash(recipient).call();
//     //console.log('Stored Group Hash:', storedGroupHash);
//     return storedGroupHash;
//   } catch (error) {
//     console.error('Error in getStoredGroupHash:', error);
//     throw error;
//   }
// };


module.exports = { storeGroupHash };
