import 'dotenv/config';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // tenderly: {
    //   url: process.env.TENDERLY_SEPOLIA_URL || '',
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || '',
  },
  sourcify: {
    enabled: true,
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['externalArtifacts/*.json'],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true', // Only enable if REPORT_GAS=true
    currency: 'USD',
  },
};

export default config;
