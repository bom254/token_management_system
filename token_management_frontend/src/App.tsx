import React, { createContext, useState} from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { SuiClient} from '@mysten/sui.js/client';
import Dashboard from './components/Dashboard';
import SendTokens from './components/SendTokens';
import MintTokens from './components/MintTokens';

// Defining the shape of the App context
interface AppContextType {
  userAddress: string | null;
  isAdmin: boolean;
  handleConnectWallet: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

function App() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const handleConnectWallet = async () => {
    try{
      const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io'});

      // Simulating the wallet connection 
      const addr = '0x4c5fe4d8536fb17da1299ec03476cbe0a679480104bf8aa866a887c7d16e6bb4';
      setUserAddress(addr);
      const adminAddr = '0x4c5fe4d8536fb17da1299ec03476cbe0a679480104bf8aa866a887c7d16e6bb4';
      setIsAdmin(addr == adminAddr);
    } catch(error) {
      console.error('Wallet conncetion failed: ',error);
    }
  };

  const contextValue: AppContextType = {
    userAddress,
    isAdmin,
    handleConnectWallet,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className='min-h-screen bg-gray-100'>
        {!userAddress ? (
          <button
            onClick={handleConnectWallet}
            className='m-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Conncet Sui Wallet
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