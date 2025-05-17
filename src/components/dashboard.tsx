'use client';

import React, { useContext, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AccountContext } from '@/app/Provider';
import {
  getTokenMinted,
  getParties,
  callVote,
} from '../utils/contractUtilities';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateDistinctColors, getPartyColor } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface PartyData {
  name: string;
  count: number;
  color: string;
}

interface TokenSupply {
  minted: string;
  used: string;
  remain: string;
}

const Dashboard: React.FC = () => {
  const { account, isConnected } = useContext(AccountContext);
  const [tokenSupply, setTokenSupply] = useState<TokenSupply>({
    minted: '0',
    used: '0',
    remain: '0',
  });
  const [partyList, setPartyList] = useState<PartyData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showParty, setShowParty] = useState(true);
  const [partyName, setPartyName] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  const fetchTotalSupply = async () => {
    const supply = await getTokenMinted();
    setTokenSupply({
      minted: supply.minted.toString(),
      used: supply.used.toString(),
      remain: supply.remain.toString(),
    });
  };

  const fetchParty = async () => {
    const parties = await getParties();
    const distinctColors = generateDistinctColors(parties.length);

    const partiesWithColor: PartyData[] = parties.map(
      ([name, count], index) => ({
        name,
        count: Number(count),
        color: getPartyColor(name, index, distinctColors),
      }),
    );

    setShowParty(partiesWithColor.length > 0);
    setPartyList(partiesWithColor);
  };

  const initialise = () => {
    fetchParty();
    fetchTotalSupply();
  };

  useEffect(() => {
    if (isConnected) initialise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleOnClick = (name: string) => {
    setShowModal(true);
    setPartyName(name);
  };

  const handleVote = async () => {
    setIsVoting(true);
    await callVote(partyName);
    setIsVoting(false);
    setShowModal(false);
    initialise();
  };

  const chartData = {
    labels: ['Votes'],
    datasets: partyList.map(party => ({
      label: party.name,
      data: [party.count],
      backgroundColor: party.color,
    })),
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Votes Distribution',
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className='p-6 space-y-10'>
      <h1 className='text-3xl font-bold text-center'>Vote for your party</h1>

      {showParty ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2  max-w-2xl mx-auto gap-6 justify-center items-center'>
            {partyList.map(party => (
              <div
                key={party.name}
                className={`border-2 rounded-lg p-4 shadow-sm`}
                style={{ borderColor: party.color }}
              >
                <h2 className='text-xl font-semibold text-center mb-2'>
                  {party.name}
                </h2>
                <p className='text-center mb-3'>Vote count: {party.count}</p>
                {account && (
                  <div className='flex justify-center'>
                    <Button onClick={() => handleOnClick(party.name)}>
                      Vote
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className='max-w-xl mx-auto'>
            <h2 className='text-lg font-semibold text-center mb-2'>
              Votes Distribution
            </h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      ) : (
        <Alert>
          <AlertDescription>
            If you are seeing this message instead of the party list and the
            distribution, please make sure you have a Metamask wallet on your
            browser. Connect your wallet to this page and accept the permission
            request. Refresh the page for the permission re-request in case that
            you have rejected it previously.
          </AlertDescription>
        </Alert>
      )}

      <div className='max-w-sm mx-auto border rounded-lg p-4'>
        <h3 className='text-md font-semibold mb-2'>Token Information</h3>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Token minted</span>
            <span>{tokenSupply.minted}</span>
          </div>
          <div className='flex justify-between'>
            <span>Used Token (voted)</span>
            <span>{tokenSupply.used}</span>
          </div>
          <div className='flex justify-between'>
            <span>Unused Token (no vote)</span>
            <span>{tokenSupply.remain}</span>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote for {partyName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to vote for the <strong>{partyName}</strong>{' '}
              party?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote} disabled={isVoting}>
              {isVoting ? 'Voting...' : 'Vote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
