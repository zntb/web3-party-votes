/* eslint-disable @typescript-eslint/no-explicit-any */

import { ethers } from 'ethers';
import votokenABI from '../ABIs/Votoken.json';
import partyVoteABI from '../ABIs/PartyVote.json';
import { toast } from 'sonner';

export const TOKEN_CONTRACT_ADDRESS =
  '0xdC8FAADA30D9E1fE5223f1d57c0b553DF564281e';
export const VOTE_CONTRACT_ADDRESS =
  '0x7C94Dbd3b264e3f96c3d5117ed853aE98d7ca9C6';

const ERROR_DONE_VOTING = 'vote__doneVoting';
const ERROR_NO_TOKEN = 'vote__noToken';
const ERROR_GOT_TOKEN = 'mint__gotToken';

export let tokenContract: ethers.Contract | null = null;
export let voteContract: ethers.Contract | null = null;

interface WindowWithEthereum extends Window {
  ethereum?: {
    request: (request: { method: string; params?: any }) => Promise<any>;
    isMetaMask?: boolean;
  };
}

declare const window: WindowWithEthereum;

// utils/mobileDetect.ts
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

export const initializeContracts = async (): Promise<boolean> => {
  try {
    // Check if we're on mobile and use WalletConnect if needed
    if (isMobile() && !window.ethereum) {
      // Handle mobile case (we'll implement this next)
      return await initializeMobileWallet();
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }
    const provider = new ethers.BrowserProvider(
      window.ethereum as ethers.Eip1193Provider,
    );
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
    console.error('Failed to initialize contracts:', e);
    return false;
  }
};

const initializeMobileWallet = async (): Promise<boolean> => {
  try {
    // Check if MetaMask is installed
    if (window.ethereum?.isMetaMask) {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return await initializeContracts(); // Will now use the mobile MetaMask provider
    }

    // Handle case where user doesn't have MetaMask installed
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes('android');

    if (isAndroid) {
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
    } else {
      // iOS
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
    }

    return false;
  } catch (error) {
    console.error('Mobile wallet connection failed:', error);
    return false;
  }
};

const getErrorName = (error: any, abi: any): string | undefined => {
  try {
    const iface = new ethers.Interface(abi);
    const decodedError = error?.data ? iface.parseError(error.data) : undefined;
    return decodedError?.name;
  } catch {
    return undefined;
  }
};

const addTokenToMetaMask = async (): Promise<void> => {
  try {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }
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

    console.log(wasAdded ? 'Token added to MetaMask' : 'Token not added');
  } catch (error) {
    console.error('Error adding token:', error);
  }
};

const getUsedToken = async (): Promise<number> => {
  try {
    if (!voteContract) throw new Error('Vote contract not initialized');
    const used = await voteContract.totalVoteUsed();
    return Number(used);
  } catch (e) {
    console.error('Failed to get used token:', e);
    return 0;
  }
};

export const mintToken = async (): Promise<boolean> => {
  try {
    if (!tokenContract) throw new Error('Token contract not initialized');
    const tx = await tokenContract.mint();
    console.log('Mint transaction:', tx);
    await tx.wait();
    console.log('Minting completed!');
    await addTokenToMetaMask();
    return true;
  } catch (error: any) {
    const errorName = getErrorName(error, votokenABI.abi);
    if (error?.reason === 'rejected') {
      toast.error(
        'Token minting has been rejected! Please relogin again and accept the request.',
      );
    } else if (errorName === ERROR_GOT_TOKEN) {
      console.log('User already got the token');
      return true;
    } else {
      toast.error('Token minting failed! Please relogin again!');
    }
    return false;
  }
};

export const getTokenMinted = async (): Promise<{
  minted: number;
  used: number;
  remain: number;
}> => {
  try {
    if (!tokenContract) throw new Error('Token contract not initialized');
    const mintedToken = await tokenContract.totalSupply();
    const supply = displayBigInt(mintedToken);
    const usedVote = await getUsedToken();
    const remaining = supply - usedVote;

    return {
      minted: supply,
      used: usedVote,
      remain: remaining,
    };
  } catch (error) {
    console.error(error);
    return { minted: 0, used: 0, remain: 0 };
  }
};

export const addParty = async (name: string): Promise<void> => {
  try {
    if (!voteContract) throw new Error('Vote contract not initialized');
    const tx = await voteContract.addParty(name);
    console.log('Add party transaction:', tx);
    await tx.wait();
    toast.success(`Successfully added ${name} to the party!`);
  } catch (error) {
    console.error('Something went wrong - Adding party rejected!', error);
    toast.error('Adding party rejected!');
  }
};

// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export const getParties = async (): Promise<Array<[string, BigInt]>> => {
  if (!voteContract) throw new Error('Vote contract not initialized');
  return await voteContract.getParties();
};

export const callVote = async (name: string): Promise<void> => {
  try {
    if (!voteContract) throw new Error('Vote contract not initialized');
    const tx = await voteContract.vote(name);
    console.log('Voting transaction:', tx);
    await tx.wait();
    toast.success(`You have voted for ${name}!`);
  } catch (error: any) {
    const errorName = getErrorName(error, partyVoteABI.abi);
    if (error?.reason === 'rejected') {
      toast.error('Voting request has been rejected! Please try again!');
    } else if (errorName === ERROR_NO_TOKEN) {
      toast.error("You don't have the token! You're not eligible to vote.");
    } else if (errorName === ERROR_DONE_VOTING) {
      toast.error('You have already voted!');
    } else {
      toast.error('Voting failed! Please try again!');
    }
  }
};

export const getVotes = async (voter: string): Promise<any | null> => {
  try {
    if (!voteContract) throw new Error('Vote contract not initialized');

    // Validate the address first
    if (!ethers.isAddress(voter)) {
      throw new Error('Invalid Ethereum address');
    }

    const votes = await voteContract.getVotes(voter);
    return votes ?? null;
  } catch (error) {
    console.error('Error fetching votes:', error);
    return null;
  }
};

export const displayBigInt = (count: bigint | string): number => {
  const supply = ethers.formatUnits(count.toString(), 18);
  return Math.round(Number(supply));
};

export const checkOwner = async (address: string): Promise<boolean> => {
  try {
    if (!voteContract) throw new Error('Vote contract not initialized');
    const owner: string = await voteContract.owner();
    return ethers.getAddress(owner) === ethers.getAddress(address);
  } catch (e) {
    console.error('Failed to get owner address:', e);
    return false;
  }
};
