import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import axios from 'axios';

function TransactionHistory() {
  const { userAddress } = useContext(AppContext);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/transactions?address=${userAddress}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTransactions(response.data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };
    if (userAddress) fetchTransactions();
  }, [userAddress]);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-600">No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx, idx) => (
            <li key={idx} className="p-3 bg-white rounded shadow">
              {tx.from === userAddress ? 'Sent' : 'Received'} {tx.amount} TOK{' '}
              {tx.from === userAddress ? 'to' : 'from'} {tx.from === userAddress ? tx.to : tx.from}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionHistory;