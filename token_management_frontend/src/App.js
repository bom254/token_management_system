import React, { createContext, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import Dashboard from './components/Dashboard';
import SendTokens from './components/SendTokens';
import MintTokens from './components/MintTokens';

export const AppContext = createContext();

function App() {
  const [userAddress, setUserAddress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleConnectWallet = async () => {
    try {
      const client = new SuiClient({ url: getFullnodeUrl('testnet') });
      // Placeholder for wallet connection (requires wallet adapter)
      const addr = '0xUSER_ADDRESS'; // Replace with actual wallet logic
      setUserAddress(addr);
      const adminAddr = '0x1'; // Replace with actual admin address
      setIsAdmin(addr === adminAddr);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <AppContext.Provider value={{ userAddress, isAdmin, handleConnectWallet }}>
      <div className="min-h-screen bg-gray-100">
        {!userAddress ? (
          <button
            onClick={handleConnectWallet}
            className="m-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Sui Wallet
          </button>
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/send" element={<SendTokens />} />
              {isAdmin && <Route path="/mint" element={<MintTokens />} />}
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;