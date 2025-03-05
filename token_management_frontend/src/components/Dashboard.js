import React, { useContext, useEffect, useState} from 'react';
import { AppContext } from '../App';
import { getProvider, executeMoveCall } from '@mysten/sui.js';
import TransactionHistory from './TransactionHistory';

function Dashboard() {
    const { userAddress } = useContext(AppContext);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            const provider = getProvider('testnet');
            const ledgerAddr = '';
            const result = await provider.call('token_management_system::simple_token_management::balance_of', {
                args: [ledgerAddr, userAddress],
            });
            setBalance(result);
        };

        if(userAddress) fetchBalance();
    }, [userAddress]);

    return (
        <div className='p-6 max-w-3x1 mx-auto'>
            <h1 className='text-3x1 font-bold text-gray-800 mb-4'>Dashboard</h1>
            <p className='text-1g text-gray-700 mb-6'>Balance: {balance} TOK</p>
            <div className='space-x-4'>
                <a href='/send' className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'>
                Send Tokens
                </a>
                {useContext(AppContext).isAdmin && (
                    <a href='/mint' className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600'>
                        Mint Tokens
                    </a>
                )}
            </div>
            <TransactionHistory />
        </div>
    );
}

export default Dashboard;