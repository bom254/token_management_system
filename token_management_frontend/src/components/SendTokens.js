import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { SuiClient, getFullnodeUrl } from '@mysten/sui';
import { TransactionBlock } from '@mysten/sui';

function SendTokens() {
  const { userAddress } = useContext(AppContext);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const client = new SuiClient({ url: getFullnodeUrl('testnet') });
      const txb = new TransactionBlock();
      txb.moveCall({
        target: '0xPACKAGE_ID::simple_token_management::transfer',
        arguments: [txb.object(process.env.LEDGER), txb.pure(amount), txb.pure(toAddress)],
      });
      // Requires wallet signer for execution
      alert('Tokens sent successfully! (Simulation)');
      setToAddress('');
      setAmount('');
    } catch (error) {
      alert('Transfer failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Send Tokens</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Recipient Address"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          min="1"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send Tokens'}
        </button>
      </form>
    </div>
  );
}

export default SendTokens;