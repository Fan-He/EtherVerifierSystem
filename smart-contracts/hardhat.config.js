// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.24",
// };

// Import the required Hardhat package. 
// This assumes you already have hardhat installed (`npm install --save-dev hardhat`)
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.8", // Specify the version of Solidity you are using
  networks: {
    hardhat: {},
    sepolia: {
        url: `https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a`,
        accounts: [`0x2c02bc078bc2f0702f1bbbd1e32d56e3ad8fcc317bc83c1856e34f0528f437a8`] 
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

