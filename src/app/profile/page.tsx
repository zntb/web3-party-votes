'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AccountContext } from '../Provider';
import { getVotes } from '@/utils/contractUtilities';
import { useRouter } from 'next/navigation';
import VoteCard from '@/components/vote-card';

interface VoterData {
  name: string;
  hasVoted: boolean;
  party: string;
  timestamp?: string;
}

const Profile: React.FC = () => {
  const { account } = useContext(AccountContext);
  const router = useRouter();
  const [voter, setVoter] = useState<VoterData | null>(null);

  const getVoter = async () => {
    if (!account) return;
    const [name, hasVoted, party, timestamp] = await getVotes(account);
    setVoter({ name, hasVoted, party, timestamp });
  };

  useEffect(() => {
    if (account) getVoter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div className='flex flex-col items-center justify-center px-4 py-8'>
      <h1 className='text-4xl font-bold mb-8'>My Profile</h1>

      {!account ? (
        <div className='text-center space-y-4'>
          <p className='text-gray-600 max-w-md'>
            By registering or logging in, you will be connected to your wallet
          </p>
        </div>
      ) : (
        <div className='w-full max-w-md space-y-6'>
          <VoteCard account={account} voter={voter} />

          {!voter?.hasVoted && (
            <div className='text-center'>
              <Button onClick={() => router.push('/')} size='lg'>
                Use your vote now!
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
