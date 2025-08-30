import React from 'react';
import { AppNotification } from '../types';
import { ChestIcon, CoinIcon, ReputationIcon } from './icons';

const NotificationToast: React.FC<{ message: string }> = ({ message }) => {
    const lowerCaseMessage = message.toLowerCase();

    const getIcon = () => {
        if (lowerCaseMessage.includes('emas')) {
            return <CoinIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />;
        }
        if (lowerCaseMessage.includes('reputasi')) {
            return <ReputationIcon className="w-6 h-6 text-amber-200 flex-shrink-0" />;
        }
        if (lowerCaseMessage.includes('item') || lowerCaseMessage.includes('diperoleh')) {
            return <ChestIcon className="w-6 h-6 text-amber-400 flex-shrink-0" />;
        }
        // Ikon default jika tidak ada kata kunci yang cocok
        return <ChestIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />;
    };

    return (
        <div className="bg-slate-800 border border-amber-500 rounded-lg shadow-lg p-3 flex items-center gap-3 w-72 animate-toast">
            {getIcon()}
            <p className="text-slate-200 text-sm">{message}</p>
        </div>
    );
};

interface NotificationContainerProps {
    notifications: AppNotification[];
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications }) => {
    return (
        <div className="fixed top-5 right-5 z-50 space-y-3">
            {notifications.map(notif => (
                // FIX: Corrected variable name from 'not' to 'notif' to match the map function parameter.
                <NotificationToast key={notif.id} message={notif.message} />
            ))}
        </div>
    );
};

export default NotificationContainer;