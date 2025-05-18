import { ethers } from 'hardhat';

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
  const party = await Party.deploy('Republicans', tokenContractAddress); // Initial party

  await party.waitForDeployment();
  const partyContractAddress = await party.getAddress();
  console.log('Party address:', partyContractAddress);

  // Add Democrats party after deployment
  const partyContract = await ethers.getContractAt(
    'PartyVote',
    partyContractAddress,
  );
  await partyContract.addParty('Democrats');
  console.log('Added Democrats party');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
