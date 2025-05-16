import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import '../styles/search.css';
import VoteCard from './voteCard';
import { getVotes } from '../utils/contractUtilities';

const Search = () => {
  const [searched, setSearched] = useState(false);
  const [address, setAddress] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');
  const [voter, setVoter] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const searchVoter = async () => {
    setIsLoading(true);
    const voter = await getVotes(address);
    if(voter){
      setVoter(voter);
      setDisplayAddress(address);
      setSearched(true);
    }
    setIsLoading(false);
  };

  const searchForm = () => {
    return (
      <div>
        <InputGroup className="mb-3 input-form">
          <Form.Control
            size="lg"
            placeholder="e.g. 0xae....44cb"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Button variant="primary" id="search" onClick={searchVoter}>
            Search
          </Button>
        </InputGroup>
      </div>
    );
  };

  return (
    <div className="justify-content-center">
      <h1>Search vote by address</h1>
      {searchForm()}
      {isLoading && <div>Searching...</div>}
      {!isLoading && searched && <VoteCard account={displayAddress} voter={voter} />}
    </div>
  );
}

export default Search;
