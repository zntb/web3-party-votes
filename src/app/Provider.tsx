'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { mintToken, initializeContracts } from '../utils/contractUtilities';

declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string }) => Promise<string[]>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (
        event: string,
        callback: (...args: any[]) => void,
      ) => void;
    };
  }
}

type Web3ContextType = {
  account: string | null;
  login: () => Promise<void>;
  logout: () => void;
  inProgress: boolean;
  isConnected: boolean;
};

const AccountContext = createContext<Web3ContextType>({
  account: null,
  login: async () => {},
  logout: () => {},
  inProgress: false,
  isConnected: false,
});

interface AccountProviderProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: AccountProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await initializeContracts();
        setIsConnected(true);

        const storedAccount = localStorage.getItem('account');
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (storedAccount && accounts.includes(storedAccount)) {
          setAccount(storedAccount);
        }
      }
    };

    init();

    // Handle account change
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected in MetaMask
        logout();
      } else if (
        account &&
        accounts[0].toLowerCase() !== account.toLowerCase()
      ) {
        // Account changed, log out
        logout();
      }
    };

    window.ethereum?.on?.('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener?.(
        'accountsChanged',
        handleAccountsChanged,
      );
    };
  }, [account]);

  const login = async () => {
    if (!window.ethereum) {
      alert('You need to have a MetaMask account to login!');
      return;
    }

    setInProgress(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const selectedAccount = accounts[0];
      const loggedIn = await mintToken();

      if (loggedIn) {
        setAccount(selectedAccount);
        localStorage.setItem('account', selectedAccount); // persist
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      if (error?.code === 4001) {
        alert('Login rejected. Please try again.');
      } else {
        alert('Failed to initialize or mint token. Please try again.');
      }
    } finally {
      setInProgress(false);
    }
  };

  const logout = () => {
    setAccount(null);
    localStorage.removeItem('account');
  };

  return (
    <AccountContext.Provider
      value={{ account, login, logout, inProgress, isConnected }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountProvider };
