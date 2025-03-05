import React, { createContext, useState} from 'react';
import { BrowserRouter, Routes, Route }  from 'react-router-dom';
import { getProvider, connect} from '@mysten/sui.js'; // Sui SDK
import Dashboard from './components/Dashboard';
import SendTokens from './components/SendTokens';
import MintTokens from './components/MintTokens';

export const AppContext = createContext();

function App() {
  const [userAddress, setUserAddress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleConnectWallet = async () => {
    try{
      const provider = getProvider('testnet'); // Use Sui testnet
      const wallet = await connect(provider);
      const addr = wallet.account.address;
      setUserAddress(addr);

      // Replace with actual admin address from contract deployment
      const adminAddr = '0x1'; // Example admin address
      setIsAdmin(addr == adminAddr);
    } catch(error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <AppContext.provider value={{ userAddress, isAdmin, handleConnectWallet}}>
      <div className='min-h-screen bg-gray-100'>
        {!userAddress ? (
          <button
          onClick={handleConnectWallet}
          className='m-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-60'
          >
            Connect Sui Wallet
          </button>
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/send' element={<SendTokens />} />
              {isAdmin && <Route path='/mint' element={<MintTokens />} />}
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </AppContext.provider>
  );
}

export default App;