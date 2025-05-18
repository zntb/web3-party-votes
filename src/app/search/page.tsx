'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VoteCard from '@/components/vote-card';
import { getVotes } from '@/utils/contractUtilities';
import { toast } from 'sonner';
import { ethers } from 'ethers';

const Search = () => {
  const [searched, setSearched] = useState(false);
  const [address, setAddress] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');
  const [voter, setVoter] = useState<{
    name: string;
    hasVoted: boolean;
    party: string;
    timestamp: bigint;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);

  const searchVoter = async () => {
    if (!address) return;

    if (!ethers.isAddress(address)) {
      setIsValidAddress(false);
      toast.error('Please enter a valid Ethereum address');
      setVoter(null); // Clear voter if address is invalid
      setSearched(false); // Reset search state
      return;
    }

    setIsValidAddress(true);
    setIsLoading(true);

    try {
      const result = await getVotes(address);

      if (result === null) {
        toast.error('No voting record found for this address');
        setVoter(null); // Clear voter if no record
        setSearched(true);
        setDisplayAddress(address);
        return;
      }

      const [name, hasVoted, party, timestamp] = result;
      setVoter({ name, hasVoted, party, timestamp });
      setDisplayAddress(address);
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search for this address');
      setVoter(null); // Clear voter on error
      setSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center px-4 py-8 space-y-6'>
      <h1 className='text-3xl font-bold text-center'>Search vote by address</h1>

      <div className='flex flex-col w-full max-w-md space-y-2'>
        <div className='flex space-x-2'>
          <Input
            type='text'
            placeholder='e.g. 0xae....44cb'
            value={address}
            onChange={e => {
              setAddress(e.target.value);
              setIsValidAddress(true); // Reset validation on change
            }}
            className={`flex-1 ${!isValidAddress ? 'border-red-500' : ''}`}
            onKeyDown={e => e.key === 'Enter' && searchVoter()}
          />
          <Button onClick={searchVoter} disabled={!address || isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {isLoading && <div className='text-gray-500'>Searching...</div>}

      {!isLoading && searched && voter && voter.hasVoted && (
        <div className='w-full max-w-md'>
          <VoteCard account={displayAddress} voter={voter} />
        </div>
      )}

      {!isLoading && searched && voter && !voter.hasVoted && (
        <div className='text-gray-500'>
          This address exists but hasn&apos;t voted yet
        </div>
      )}
    </div>
  );
};

export default Search;
