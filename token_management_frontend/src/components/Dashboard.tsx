import React, {useContext, useEffect, useState} from "react";
import { AppLoadContext } from "../App";
import { SuiClient } from "@mysten/sui.js/dist/cjs/client";
import TransactionHistory from './TransactionHistory';

function Dashboard() {
    const context = useContext(AppContext);
    if(!context) throw new Error('AppContext must be used within AppContext.Provider');
    const { userAddress, isAdmin} = context;
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        const fetchBalance = async() => {
            const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io'});
            const ledgerAddr = '0x73d99b2ba20ab706dead4d3c2138fb0390b7d991825524b5fdab4ce0ad24a8ec';
            const result = await client.callFunction({
                packageObjectId: '0x8cb034311bedd1a5921d29e4a6f060f4fdfa41b8639f188e9738afc17b9840a3',
                module: 'simple_token_management',
                function: 'balance_of',
                arguments: [ledgerAddr, userAddress],
            });
            setBalance(result.results[0].returnValues[0][0]);
        };
        if(userAddress) fetchBalance();
    }, [userAddress]);

    return(
        <div className="p-6 max-w-3x1 mx-auto">
            <h1 className="text-3x1 font-bold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-lg text-gray-700 mb-6">Balance: {balance} TOK</p>
            <div className="space-x-4">
                <a href="/send" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Send Tokens
                </a>
                {isAdmin && (
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