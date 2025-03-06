import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import TransactionHistory from './TransactionHistory';

function Dashboard() {
  const { userAddress } = useContext(AppContext);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const client = new SuiClient({ url: getFullnodeUrl('testnet') });
      const ledgerAddr = process.env.LEDGER;
      const result = await client.callFunction({
        packageObjectId: process.env.PACKAGEID,
        module: 'simple_token_management',
        function: 'balance_of',
        arguments: [ledgerAddr, userAddress],
      });
      setBalance(result.results[0].returnValues[0][0]); // Adjust based on response
    };
    if (userAddress) fetchBalance();
  }, [userAddress]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-lg text-gray-700 mb-6">Balance: {balance} TOK</p>
      <div className="space-x-4">
        <a href="/send" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Send Tokens
        </a>
        {useContext(AppContext).isAdmin && (
          <a href="/mint" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Mint Tokens
          </a>
        )}
      </div>
      <TransactionHistory />
    </div>
  );
}

export default Dashboard;