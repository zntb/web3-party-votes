const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // deploying token contract
  const Token = await ethers.getContractFactory('Votoken');
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenContractAddress = await token.getAddress();
  console.log('Token address:', tokenContractAddress);

  // deploying voting contract
  const Party = await ethers.getContractFactory('PartyVote');
  const party = await Party.deploy('Republicans', tokenContractAddress); // add party on initialised deployment
  await party.waitForDeployment();
  const partyContractAddress = await party.getAddress();
  console.log('Party address:', partyContractAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
