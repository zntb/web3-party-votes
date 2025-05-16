import React, { useRef, useState } from 'react';
import '../styles/add.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { addParty, getParties } from '../utils/contractUtilities';

const Add = () => {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = async () => {
    setIsLoading(true);
    const partyName = inputRef.current.value;
    if (partyName.trim()) {
      const isNameExists = await checkPartyName(partyName.trim());
      if (!isNameExists) {
        await addParty(partyName);
        inputRef.current.value = null;
      } else {
        alert('Party name already exists! Please use another name');
      }
    } else {
      alert('Please enter a party name');
    }
    setIsLoading(false);
  };

  const checkPartyName = async (name) => {
    const parties = await getParties();
    return parties.find(item => item[0] === name) !== undefined;
  }

  return (
    <div>
      <h1>Add New Party</h1>
      <div>
        <InputGroup className="mb-3 input-form">
          <Form.Control
            size="lg"
            placeholder="enter new party name here ..."
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            ref={inputRef}
          />
          <Button variant="primary" id="add" onClick={handleOnClick} disabled={isLoading}>
            {isLoading ? "Adding party..." : "Add to blockchain"}
          </Button>
        </InputGroup>
      </div>
    </div>
  );
}

export default Add;