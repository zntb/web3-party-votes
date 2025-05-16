import React, { createContext, useState, useEffect } from 'react';
import { mintToken, initializeContracts } from './utils/contractUtilities';

const AccountContext = createContext();

const AccountProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        await initializeContracts();
        setIsConnected(true);
      }
    };
    checkConnection();
  }, []);
  
  const login = async () => {
    if(window.ethereum){
      let account;
      let loggedIn = false;
      setInProgress(true);
      try {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        account = accounts[0]; // default to the first account
        loggedIn = await mintToken();  // Then try to mint token
      } catch (error) {
        console.error('Error during login:', error);
        if (error?.code === 4001) {
          alert('login from wallet has been rejected. Please relogin again.');
        } else {
          alert('Failed to initialize contracts or mint token. Please try again.');
        }
      } finally {
        loggedIn && setAccount(account);
        setInProgress(false);
      }
    } else {
      alert('You need to have a metamask account to login!');
    }
  };

  const logout = () => {
    setAccount(null);
  };

  return (
    <AccountContext.Provider value={{ account, login, logout, inProgress, isConnected }}>
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountProvider };
