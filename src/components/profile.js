import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import '../styles/profile.css';
import { AccountContext } from '../Provider';
import VoteCard from './voteCard';
import { getVotes } from '../utils/contractUtilities';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { account, login, logout, inProgress } = useContext(AccountContext);
  const navigate = useNavigate();
  const [voter, setVoter] = useState();

  const getVoter = async () => {
    const voter = await getVotes(account);
    setVoter(voter);
  };

  useEffect(() => {
    account && getVoter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {!account && (
        <>
          <h4>By register or login, you will be connected to your wallet</h4>
          <div className="login-div">
            <Button variant="primary" id="login" size="lg" onClick={login} disabled={inProgress}>
              {inProgress ? "Logging in..." : "Login"}
            </Button>
          </div>
        </>
      )}

      {!!account && (
        <>
          <VoteCard account={account} voter={voter} />
          <div className="login-div">
            {(!voter?.[1] &&
              <Button variant="success" id="vote" size="lg" onClick={() => { navigate('/') }}>
                Use your vote now!
              </Button>
            )}
          </div>
          <div className="login-div">
            <Button variant="danger" id="vote" size="lg" onClick={logout}>
              Logout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;