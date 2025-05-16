# Application Name
Vote-Chain v1.0.0
<br/>

# Description
A decentralized web3 voting platform designed to enhance transparency and prevent vote manipulation. It ensures only registered voters can participate, guaranteeing a secure and tamper-proof election process.
<br/>

# Features
1. Add Party (only for the contract's owner)
2. Vote for a party (only for logged in users who has accepted the minted token)
3. Search for voters vote
<br/>

# Getting Started

You must have a Metamask wallet. Download [here](https://metamask.io/).<br/>
For testnet, you can switch Metamask network to sepolia testnet.<br/>
For localhost, add a new custom network with RPC URL `http://127.0.0.1:8545/` and chain id `31337`
<br/>

## To install dependencies

```
npm install
npx hardhat
```

## To create environment
1. Create `.env` file in the root folder
2. Go to the `.env` file and add these keys (you can choose your own constant name):
```
ALCHEMY_SEPOLIA_URL=<YOUR_KEY_HERE>
SEPOLIA_PRIVATE_KEY=<YOUR_KEY_HERE>
ETHERSCAN_KEY=<YOUR_KEY_HERE>
```
3. [Optional] Go to `hardhat.config.js` and adjust the settings.<br/>
Remove / change the `sepolia` network and `etherscan` if needed. Or change the constant name to the one you entered in `.env` file.

## To compile the contract
```
npx hardhat compile
```
After compiling, you need to copy both json files from
```
artifacts/contracts/<fileName>.sol/<fileName>.json
```
to 
```
src/ABIs/<fileName>.json
```
This need to be done everytime if the contract is changed and compiled in order to get the correct ABIs which we will be using to get the contract.

## To Start the server locally

```
npx hardhat node
```

## To deploy the contract

```
npx hardhat run scripts/deploy.js --network <localhost|sepolia>
```
After deploying, you will see 2 contract addresses on the log.<br/>
1 for the token smart contract address and 1 for the party smart contract address.<br/>
Copy the contract addresses and go to 
```
src/utils/contractUtilities.js
```
and then replace the constant value from `TOKEN_CONTRACT_ADDRESS` and `VOTE_CONTRACT_ADDRESS`.
```
export const TOKEN_CONTRACT_ADDRESS = '<your_token_smart_contract_address>'; // FILL IN TOKEN CONTRACT ADDRESS HERE
export const VOTE_CONTRACT_ADDRESS = '<your_party_smart_contract_address>'; // FILL IN PARTY VOTE CONTRACT ADDRESS HERE
```

## To run the webapp

```
npm start
```

Have fun voting!