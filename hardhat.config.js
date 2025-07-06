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
      // Uncomment below to fork from mainnet (requires valid Alchemy API key)
      // forking: {
      //   url: "https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY",
      //   blockNumber: 18000000
      // }
    }
  }
};