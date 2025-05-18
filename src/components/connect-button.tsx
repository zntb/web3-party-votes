'use client';

import { useContext, useState, useEffect } from 'react';
import { AccountContext } from '@/app/Provider';
import { Button } from '@/components/ui/button';

export const ConnectButton = () => {
  const {
    account,
    login,
    logout,
    inProgress,
    isMobile,
    connectWithWalletConnect,
    switchToSepolia,
    isConnected,
  } = useContext(AccountContext);

  const [isOnSepolia, setIsOnSepolia] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });
        setIsOnSepolia(chainId === '0xaa36a7'); // Sepolia chain ID
      }
    };

    checkNetwork();

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      setIsOnSepolia(chainId === '0xaa36a7');
    };

    window.ethereum?.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <div className='space-y-4'>
      {/* Only show network switch button if connected but not on Sepolia */}
      {isConnected && !isOnSepolia && (
        <Button
          onClick={switchToSepolia}
          className='w-full py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors'
        >
          Switch to Sepolia Network
        </Button>
      )}

      {/* Connection Buttons */}
      {account ? (
        <Button
          variant={'destructive'}
          onClick={logout}
          //   className='w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
        >
          Disconnect
        </Button>
      ) : (
        <div className='flex flex-col gap-2'>
          <Button
            onClick={login}
            disabled={inProgress}
            className={`w-full py-2 px-4 rounded transition-colors ${
              inProgress
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {inProgress ? 'Connecting...' : 'Connect with MetaMask'}
          </Button>

          {isMobile && (
            <Button
              onClick={connectWithWalletConnect}
              disabled={inProgress}
              className={`w-full py-2 px-4 rounded transition-colors ${
                inProgress
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {inProgress ? 'Connecting...' : 'Connect with WalletConnect'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
