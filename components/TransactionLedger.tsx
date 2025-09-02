import React from 'react';
import { TransactionLogEntry } from '../types';
import { BookOpenIcon, CoinIcon } from './icons';

interface TransactionLedgerProps {
    log: TransactionLogEntry[];
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ log }) => {
    const sortedLog = [...log].sort((a, b) => b.turn - a.turn);

    return (
        <div className="p-1">
            <h3 className="font-cinzel text-xl text-[var(--color-text-header)] mb-3 border-b-2 border-[var(--border-color-strong)]/50 pb-2 flex items-center gap-2 text-glow">
                <BookOpenIcon className="w-5 h-5" />
                <span>Buku Besar Transaksi</span>
            </h3>
            {sortedLog.length > 0 ? (
                <ul className="space-y-2">
                    {sortedLog.map((entry, index) => {
                        const isBuy = entry.type === 'buy';
                        return (
                            <li key={index} className={`bg-stone-950/40 p-2 rounded-md border-l-4 ${isBuy ? 'border-red-600' : 'border-green-600'}`}>
                                <div className="flex justify-between items-start text-sm">
                                    <div className="flex-grow">
                                        <p className="font-bold text-stone-200">{isBuy ? 'Pembelian' : 'Penjualan'}: {entry.itemName} (x{entry.quantity})</p>
                                        <p className="text-xs text-stone-500">Giliran ke-{entry.turn}</p>
                                    </div>
                                    <div className={`flex items-center gap-1 font-bold flex-shrink-0 ${isBuy ? 'text-red-400' : 'text-green-400'}`}>
                                        <CoinIcon className="w-4 h-4" />
                                        <span>{entry.goldAmount > 0 ? `+${entry.goldAmount}` : entry.goldAmount}</span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center text-stone-500 italic pt-10">
                    <p>Belum ada transaksi yang tercatat.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionLedger;
