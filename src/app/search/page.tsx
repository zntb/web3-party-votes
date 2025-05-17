'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VoteCard from '@/components/vote-card';
import { getVotes } from '@/utils/contractUtilities';

const Search = () => {
  const [searched, setSearched] = useState(false);
  const [address, setAddress] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');
  const [voter, setVoter] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const searchVoter = async () => {
    setIsLoading(true);
    const [name, hasVoted, party, timestamp] = await getVotes(address);
    setVoter({ name, hasVoted, party, timestamp });
    if (voter) {
      setVoter(voter);
      setDisplayAddress(address);
      setSearched(true);
    }
    setIsLoading(false);
  };

  return (
    <div className='flex flex-col items-center justify-center px-4 py-8 space-y-6'>
      <h1 className='text-3xl font-bold text-center'>Search vote by address</h1>

      <div className='flex w-full max-w-md space-x-2'>
        <Input
          type='text'
          placeholder='e.g. 0xae....44cb'
          value={address}
          onChange={e => setAddress(e.target.value)}
          className='flex-1'
        />
        <Button onClick={searchVoter} disabled={!address}>
          Search
        </Button>
      </div>

      {isLoading && <div className='text-gray-500'>Searching...</div>}

      {!isLoading && searched && voter && (
        <div className='w-full max-w-md'>
          <VoteCard account={displayAddress} voter={voter} />
        </div>
      )}
    </div>
  );
};

export default Search;
