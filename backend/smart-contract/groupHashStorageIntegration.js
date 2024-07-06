// blockchain/groupHashStorageIntegration.js
const {Web3} = require('web3');
const web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a'); 
const { abi } = require('/var/www/EtherVerifierSystem/smart-contracts/artifacts/contracts/GroupHashStorage.sol/GroupHashStorage.json'); 
const address = "0xDc49745038DA9A8D9AE162d0cF3d5277C96D04f4";

const contract = new web3.eth.Contract(abi, address);

exports.storeGroupHash = async (groupHash) => {
  const accounts = await web3.eth.getAccounts();
  const receipt = await contract.methods.storeGroupHash(groupHash).send({ from: accounts[0] });
  return receipt;
};
