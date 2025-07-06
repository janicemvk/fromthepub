require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        // Fork from mainnet to test with real Uniswap contracts
        url: "https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY",
        blockNumber: 18000000 // Use a specific block for consistency
      }
    }
  }
};