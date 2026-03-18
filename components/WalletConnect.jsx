'use client';
import { useState, useEffect } from 'react';

export default function WalletConnect() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const connectWallet = async () => {
        try {
            // Dynamically import the library only in browser
            const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');

            await web3Enable('EchoVerse');
            const allAccounts = await web3Accounts();
            setAccounts(allAccounts);

            if (allAccounts.length > 0) {
                setSelectedAccount(allAccounts[0]);
                localStorage.setItem('selectedAccount', JSON.stringify(allAccounts[0]));
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
        }
    };

    // Optionally auto-load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('selectedAccount');
        if (saved) setSelectedAccount(JSON.parse(saved));
    }, []);

    return (
        <div className="wallet-connect p-4">
            {!selectedAccount ? (
                <button
                    onClick={connectWallet}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Connect Polkadot Wallet
                </button>
            ) : (
                <div className="connected-wallet space-y-1">
                    <span className="block font-medium">{selectedAccount.meta?.name || 'Wallet Connected'}</span>
                    <span className="text-sm text-gray-500">
                        {selectedAccount.address.slice(0, 8)}...{selectedAccount.address.slice(-6)}
                    </span>
                </div>
            )}
        </div>
    );
}
