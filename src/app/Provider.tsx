/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { mintToken, initializeContracts } from '../utils/contractUtilities';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

// Sepolia network configuration
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in decimal
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/INFURA_KEY'; // Replace with your Infura key

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Web3ContextType = {
  account: string | null;
  login: () => Promise<void>;
  logout: () => void;
  inProgress: boolean;
  isConnected: boolean;
  isMobile: boolean;
  connectWithWalletConnect: () => Promise<void>;
  switchToSepolia: () => Promise<void>;
};

const AccountContext = createContext<Web3ContextType>({
  account: null,
  login: async () => {},
  logout: () => {},
  inProgress: false,
  isConnected: false,
  isMobile: false,
  connectWithWalletConnect: async () => {},
  switchToSepolia: async () => {},
});

interface AccountProviderProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: AccountProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
    );
  }, []);

  const switchToSepolia = async (): Promise<void> => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [SEPOLIA_RPC_URL],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Could not add Sepolia network', addError);
          throw new Error('Failed to add Sepolia network');
        }
      } else {
        console.error('Could not switch to Sepolia network', switchError);
        throw new Error('Failed to switch to Sepolia network');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum || provider) {
        try {
          // Ensure we're on Sepolia network
          if (window.ethereum) {
            const chainId = await window.ethereum.request({
              method: 'eth_chainId',
            });
            if (chainId !== SEPOLIA_CHAIN_ID) {
              await switchToSepolia();
            }
          }

          await initializeContracts();
          setIsConnected(true);

          const accounts = await (provider?.request
            ? provider
            : window.ethereum
          ).request({
            method: 'eth_accounts',
          });

          const storedAccount = localStorage.getItem('account');
          if (storedAccount && accounts.includes(storedAccount)) {
            setAccount(storedAccount);
          }
        } catch (error) {
          console.error('Initialization error:', error);
        }
      }
    };

    init();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        logout();
      } else if (
        account &&
        accounts[0].toLowerCase() !== account.toLowerCase()
      ) {
        logout();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const currentProvider = provider || window.ethereum;
    currentProvider?.on?.('accountsChanged', handleAccountsChanged);
    currentProvider?.on?.('chainChanged', handleChainChanged);

    return () => {
      currentProvider?.removeListener?.(
        'accountsChanged',
        handleAccountsChanged,
      );
      currentProvider?.removeListener?.('chainChanged', handleChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, provider]);

  const connectWithMetaMask = async () => {
    if (!window.ethereum) {
      if (isMobile) {
        const dappUrl = window.location.href;
        const metamaskAppUrl = `https://metamask.app.link/dapp/${encodeURIComponent(
          dappUrl,
        )}`;
        window.location.href = metamaskAppUrl;
        return;
      }
      alert('Please install MetaMask!');
      return;
    }

    setInProgress(true);
    try {
      await switchToSepolia();
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const selectedAccount = accounts[0];

      // Initialize contracts first
      await initializeContracts();

      // Try to mint token (it will handle the case where user already has token)
      const loggedIn = await mintToken();

      if (loggedIn) {
        setAccount(selectedAccount);
        localStorage.setItem('account', selectedAccount);
      }
    } catch (error: any) {
      console.error('MetaMask login error:', error);
      alert(error.message || 'Login failed');
    } finally {
      setInProgress(false);
    }
  };

  const connectWithWalletConnect = async () => {
    setInProgress(true);
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          11155111: SEPOLIA_RPC_URL, // Sepolia chain ID
        },
        chainId: 11155111, // Force Sepolia network
        qrcodeModalOptions: {
          mobileLinks: ['metamask', 'trust', 'rainbow', 'argent'],
        },
      });

      await walletConnectProvider.enable();
      setProvider(walletConnectProvider);

      const web3Provider = new ethers.BrowserProvider(walletConnectProvider);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();

      const loggedIn = await mintToken();
      if (loggedIn) {
        setAccount(address);
        localStorage.setItem('account', address);
      }
    } catch (error) {
      console.error('WalletConnect error:', error);
      alert('WalletConnect connection failed');
    } finally {
      setInProgress(false);
    }
  };

  const login = async () => {
    if (isMobile && !window.ethereum?.isMetaMask) {
      await connectWithWalletConnect();
      const minted = await mintToken();

      if (minted) {
        setIsConnected(true);
      }
    } else {
      await connectWithMetaMask();
    }
  };

  const logout = () => {
    setAccount(null);
    localStorage.removeItem('account');
    if (provider?.disconnect) {
      provider.disconnect();
    }
    setProvider(null);
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        login,
        logout,
        inProgress,
        isConnected,
        isMobile,
        connectWithWalletConnect,
        switchToSepolia,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountProvider };
