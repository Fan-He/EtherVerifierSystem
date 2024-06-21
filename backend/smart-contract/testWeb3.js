const {Web3} = require('web3');

// Check Web3 version
console.log('Web3 Version:', Web3.version);

// Verify the private key format
const privateKey = '2c02bc078bc2f0702f1bbbd1e32d56e3ad8fcc317bc83c1856e34f0528f437a8';
console.log('Trying to add private key:', privateKey);

try {
  if (privateKey.length !== 64) {
    throw new Error('Invalid private key length. Expected 64 characters.');
  }
  if (!/^([A-Fa-f0-9]{64})$/.test(privateKey)) {
    throw new Error('Invalid private key format. Expected a hexadecimal string.');
  }
  const web3 = new Web3('https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a');
  const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
  console.log('Got account:', account);
  web3.eth.accounts.wallet.add(account);
  console.log('Added private key');
} catch (error) {
  console.error('Error:', error);
}
