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
        // A generic icon for other notifications like items found
        return <ChestIcon className="w-6 h-6 text-green-400 flex-shrink-0" />;
    };

    return (
        <div className="animate-toast bg-slate-800/90 border border-slate-600 rounded-lg shadow-2xl p-4 flex items-center gap-4 w-80 max-w-sm backdrop-blur-sm">
            {getIcon()}
            <p className="text-slate-200">{message}</p>
        </div>
    );
};

const NotificationContainer: React.FC<{ notifications: AppNotification[] }> = ({ notifications }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <NotificationToast key={notification.id} message={notification.message} />
            ))}
        </div>
    );
};

export default NotificationContainer;
