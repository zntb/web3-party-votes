'use client';

import React, { useRef, useState } from 'react';
import { addParty, getParties } from '@/utils/contractUtilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const Add: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOnClick = async (): Promise<void> => {
    setIsLoading(true);
    const partyName = inputRef.current?.value;

    if (partyName?.trim()) {
      const isNameExists = await checkPartyName(partyName.trim());
      if (!isNameExists) {
        await addParty(partyName);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      } else {
        alert('Party name already exists! Please use another name');
      }
    } else {
      alert('Please enter a party name');
    }
    setIsLoading(false);
  };

  const checkPartyName = async (name: string): Promise<boolean> => {
    const parties: string[] = (await getParties()).map(([name]) => name);
    return parties.includes(name);
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <h1 className='text-2xl font-bold'>Add New Party</h1>
      </CardHeader>
      <CardContent>
        <div className='flex w-full items-center space-x-2'>
          <Input
            type='text'
            placeholder='Enter new party name here...'
            ref={inputRef}
            className='flex-1'
          />
          <Button onClick={handleOnClick} disabled={isLoading}>
            {isLoading ? 'Adding party...' : 'Add to blockchain'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Add;
