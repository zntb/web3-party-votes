'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface VoterData {
  name: string;
  hasVoted: boolean;
  party: string | number | null;
}

interface VoteCardProps {
  account: string;
  voter: VoterData | null;
}

const VoteCard: React.FC<VoteCardProps> = ({ account, voter }) => {
  const blockTimeStamp = (timestamp: string | number | null) => {
    const date = new Date(Number(timestamp) * 1000);
    return dayjs(date).format('DD MMM YYYY, HH:mm:ss');
  };

  const voterName = voter?.name.slice(0, -1);
  const address = `https://sepolia.etherscan.io/address/${account}`;

  return (
    <Card className='w-full max-w-md mx-auto mt-4'>
      <CardContent className='p-6 space-y-4 text-sm'>
        <div className='flex flex-col items-center break-words'>
          <span className='text-xl font-semibold text-gray-600 mb-2'>
            Address
          </span>
          <Link
            href={address}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 text-center scale-100 hover:text-blue-700 hover:scale-105 hover:opacity-100 transition-all'
          >
            <span>{account}</span>
          </Link>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Voted for</span>
          <span className='font-medium'>{voterName ?? '--'}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Voted on</span>
          <span className='font-medium'>
            {voter?.party ? blockTimeStamp(voter.party) : '--'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoteCard;
