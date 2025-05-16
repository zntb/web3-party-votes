import React, { useContext, useEffect, useState } from 'react';
import '../styles/dashboard.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Modal, Button } from 'react-bootstrap';
import { AccountContext } from '../Provider';
import {
  getTokenMinted,
  getParties,
  callVote,
} from '../utils/contractUtilities';

// Register necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
const CHART_OPTIONS = {
  indexAxis: 'y', // This makes the chart horizontal
  responsive: true,
  scales: {
    x: {
      stacked: true, // Stacks the bars together horizontally
      display: false, // Hides the x-axis grid and labels
    },
    y: {
      stacked: true,
      display: false,
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
      },
    },
    title: {
      display: true,
      text: 'Votes Distribution',
      font: {
        size: 20,
      },
    },
  },
  layout: {
    padding: {
      top: 100,
      right: 0,
      left: 0,
    },
  },
  barThickness: 30, // Fixed bar thickness (set to your preference)
  maxBarThickness: 30, // Maximum bar thickness
  animation: false,
};

// Function to generate random colors
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const Dashboard = () => {
  const { account, isConnected } = useContext(AccountContext);
  const [tokenSupply, setTokenSupply] = useState({
    minted: '0',
    used: '0',
    remain: '0',
  });
  const [partyList, setPartyList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showParty, setShowParty] = useState(true);
  const [partyName, setPartyName] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const fetchTotalSupply = async () => {
    const supply = await getTokenMinted();
    setTokenSupply(supply);
  };

  const fetchParty = async () => {
    const parties = await getParties();
    const partiesWithColor = parties?.map(party => {
      return {
        name: party[0],
        count: Number(party[1]),
        color: getRandomColor(),
      };
    });
    setShowParty(partiesWithColor?.length > 0 ? true : false);
    setPartyList(partiesWithColor);
  };

  const initialise = () => {
    fetchParty();
    fetchTotalSupply();
  };

  useEffect(() => {
    isConnected && initialise();
    // eslint-disable-next-line
  }, [isConnected]);

  const handleOnClick = name => {
    handleShow();
    setPartyName(name);
  };

  const handleVote = async () => {
    setIsVoting(true);
    await callVote(partyName);
    setIsVoting(false);
    handleClose();
    initialise();
  };

  const displayCard = () => {
    return partyList?.map(party => {
      return (
        <div
          key={party.name}
          className='party-card'
          style={{ borderColor: party.color }}
        >
          <div className='card-title'>{party.name}</div>
          <div className='card-description'>
            <div>Vote count: {party.count}</div>
            {!!account && (
              <div>
                <Button
                  variant='success'
                  id='vote'
                  size='sm'
                  onClick={() => handleOnClick(party.name)}
                >
                  Vote
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const datasets = partyList?.map(party => ({
    label: party.name,
    data: [party.count],
    backgroundColor: party.color,
  }));

  const data = {
    labels: ['vote count'],
    datasets: datasets,
  };

  return (
    <div>
      <h1>Vote for your party</h1>

      {showParty ? (
        <>
          <div className='party-card-div'>{displayCard()}</div>
          <div className='vote-bar-div'>
            <Bar data={data} options={CHART_OPTIONS} />
          </div>
        </>
      ) : (
        <div className='no-party'>
          <h4>
            If you are seeing this message instead of the party list and the
            distribution,
            <br />
            please make sure you have a Metamask wallet on your browser.
            <br />
            Connect your wallet to this page and accept the permission request.
            <br />
            <br />
            Refresh the page for the permission re-request in case that you have
            rejected it previously.
          </h4>
        </div>
      )}

      <div className='token-container'>
        <div className='token-div'>
          <div className='d-flex'>
            <div>Token minted</div>
            <div>{tokenSupply.minted}</div>
          </div>
          <div className='d-flex'>
            <div>Used Token (voted)</div>
            <div>{tokenSupply.used}</div>
          </div>
          <div className='d-flex'>
            <div>Unused Token (no vote)</div>
            <div>{tokenSupply.remain}</div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Vote for {partyName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to vote for {partyName} party?
        </Modal.Body>
        <Modal.Footer>
          <Button variant='outline-secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='success' onClick={handleVote} disabled={isVoting}>
            Vote
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
