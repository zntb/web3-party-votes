import React from 'react';
import dayjs from 'dayjs';

const VoteCard = ({account, voter}) => {
    const blockTimeStamp = () => {
      const timestampInSeconds = Number(voter?.[2]);
      const date = new Date(timestampInSeconds * 1000); // Multiply by 1000 to convert to milliseconds
      const formattedDate = dayjs(date).format('DD MMM YYYY, HH:mm:ss');
      return formattedDate;
    }

    return (
        <div className="token-container">
          <div className="token-div">
            <div className="d-flex">
              <div className="address">
                {account}
              </div>
            </div>
            <div className="d-flex">
              <div>Voted for</div>
              <div>{voter?.[0]?.[0] && voter[0][0] !== '' ? voter[0][0] : '--'}</div>
            </div>
            <div className="d-flex">
              <div>Voted on</div>
              <div>{voter?.[2] ? blockTimeStamp() : '--'}</div>
            </div>
          </div>
        </div>
    );
}

export default VoteCard;
