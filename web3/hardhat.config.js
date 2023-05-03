/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.9',
    defaultNetwork: 'sepolia',
    networks:{
      hardhat: {},
      sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_PRIVATE_KEY}`,
        accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`]
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
