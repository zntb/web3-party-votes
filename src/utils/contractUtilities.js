import { ethers } from 'ethers';
import votokenABI from '../ABIs/Votoken.json';
import partyVoteABI from '../ABIs/PartyVote.json';

export const TOKEN_CONTRACT_ADDRESS =
  '0xd3FbeEAb3cf159140b33DcE45F5452F40cB5bB63'; // FILL IN TOKEN CONTRACT ADDRESS HERE
export const VOTE_CONTRACT_ADDRESS =
  '0xF44E354e28bdB705C16786479b781D07D9Ed16C9'; // FILL IN PARTY VOTE CONTRACT ADDRESS HERE

// error names in constant
const ERROR_DONE_VOTING = 'vote__doneVoting';
const ERROR_NO_TOKEN = 'vote__noToken';
const ERROR_GOT_TOKEN = 'mint__gotToken';

// Global contract instances
export let tokenContract = null;
export let voteContract = null;

export const initializeContracts = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    tokenContract = new ethers.Contract(
      TOKEN_CONTRACT_ADDRESS,
      votokenABI.abi,
      signer,
    );
    voteContract = new ethers.Contract(
      VOTE_CONTRACT_ADDRESS,
      partyVoteABI.abi,
      signer,
    );
    return true;
  } catch (e) {
    console.log('Failed to initialize contracts: ', e);
    return false;
  }
};

const getErrorName = (error, abi) => {
  const iface = new ethers.Interface(abi);
  const decodedError = error?.data ? iface.parseError(error.data) : '';
  return decodedError?.name;
};

const addTokenToMetaMask = async () => {
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: TOKEN_CONTRACT_ADDRESS,
          symbol: 'VTK',
          decimals: 18,
        },
      },
    });
    wasAdded
      ? console.log('Token added to MetaMask')
      : console.log('Token not added');
  } catch (error) {
    console.error('Error adding token:', error);
  }
};

const getUsedToken = async () => {
  try {
    const used = await voteContract.totalVoteUsed();
    const count = Number(used);
    return count;
  } catch (e) {
    console.log('failed to get used token: ', e);
  }
  return 0;
};

export const mintToken = async () => {
  try {
    const tx = await tokenContract.mint();
    console.log('Mint transaction:', tx);
    await tx.wait();
    console.log('Minting completed!');
    await addTokenToMetaMask();
  } catch (error) {
    const errorName = getErrorName(error, votokenABI.abi);
    if (error?.reason === 'rejected') {
      alert(
        'token minting has been rejected! Please relogin again and accept the request.',
      );
    } else if (errorName === ERROR_GOT_TOKEN) {
      console.log('user already got the token');
      return true;
    } else {
      alert('token minting fail! please relogin again!');
    }
    return false;
  }
  return true;
};

export const getTokenMinted = async () => {
  try {
    const mintedToken = await tokenContract?.totalSupply();
    const supply = displayBigInt(mintedToken);
    const usedVote = await getUsedToken();
    const remaining = supply - usedVote;

    return {
      minted: supply,
      used: usedVote,
      remain: remaining,
    };
  } catch (error) {
    console.log(error);
  }
  return {
    minted: '0',
    used: '0',
    remain: '0',
  };
};

export const addParty = async name => {
  try {
    const tx = await voteContract.addParty(name);
    console.log('add party transaction:', tx);
    await tx.wait();
    alert(`successfully added ${name} to the party!`);
  } catch (error) {
    alert('adding party rejected!');
  }
};

export const getParties = async () => {
  try {
    const parties = await voteContract.getParties();
    return parties;
  } catch (e) {
    console.log('get party failed: ', e);
  }
  return [];
};

export const callVote = async name => {
  try {
    const tx = await voteContract.vote(name);
    console.log('voting transaction:', tx);
    await tx.wait();
    alert(`You have voted for ${name}!`);
  } catch (error) {
    const errorName = getErrorName(error, partyVoteABI.abi);
    if (error?.reason === 'rejected') {
      alert(`Voting request has been rejected! Please try again!`);
    } else if (errorName === ERROR_NO_TOKEN) {
      alert(`You don't have the token! you're not eligible to vote.`);
    } else if (errorName === ERROR_DONE_VOTING) {
      alert('You have already voted!');
    } else {
      alert(`Voting failed! Please try again!`);
    }
  }
};

export const getVotes = async voter => {
  try {
    const votes = await voteContract.getVotes(voter);
    return votes ?? null;
  } catch (error) {
    alert('Address not found! Please enter a valid address');
  }
};

export const displayBigInt = count => {
  const supply = ethers.formatUnits(count?.toString(), 18);
  return Math.round(Number(supply));
};

export const checkOwner = async address => {
  try {
    const owner = await voteContract.owner();
    return ethers.getAddress(owner) === ethers.getAddress(address);
  } catch (e) {
    console.log('fail to get owner address: ', e);
  }
  return false;
};
