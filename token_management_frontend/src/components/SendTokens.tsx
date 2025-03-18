import React, { useContext, useState} from "react";
import { AppContext } from "../App";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/dist/cjs/client";
import { TransactionBlock } from "@mysten/sui.js/dist/cjs/transactions";

function SendTokens() {
    const context = useContext(AppContext);
    if(!context) throw new Error('AppContext must be used within AppContext.Provider');
    const { userAddress} = context;
    const [toAddress, setToAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try{
            const client = new SuClient({ url: getFullnodeUrl('testnet')});
            const txb = new TransactionBlock();
            txb.moveCall({
                target: '0x8cb034311bedd1a5921d29e4a6f060f4fdfa41b8639f188e9738afc17b9840a3::simple_token_management::transfer',
                arguments: [txb.object('0x8cb034311bedd1a5921d29e4a6f060f4fdfa41b8639f188e9738afc17b9840a3'), txb.pure(amount), txb.pure(toAddress)],
            });

            // Sign and execute which requires wallet intergration
            alert('Tokens sent successfully!(Simulation)');
            setToAddress('');
            setAmount('');
        } catch (error) {
            alert('Transfer failed: ' + (error as Error).message);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2x1 font-semibold text-gray-800 mb-4">Send Tokens</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input  
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="Recipient Address"
                    className="w-full p-2 border border-gray-300 rounded focus:outine-none focus:ring-2 focus:ring-green-500"
                    required
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="Recipient Address"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disable:bg-gray-400"
                >
                    {loading ? 'Sending...' : 'Send Tokens'}
                </button>
            </form>
        </div>
    );
}

export default SendTokens;