import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

interface Business {
    _id: string;
    customId: number;
    type: string;
    name: string;
    ownerName: string;
    address: string;
    lastInspectionDate?: string | null;
}

const getDaysUntilInspection = (lastDate?: string | null): number | null => {
    if (!lastDate) return null;
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(next.getDate() + 60);
    return Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getRowColor = (days: number | null): string => {
    if (days === null) return '';
    if (days <= 7) return 'border-l-4 border-red-500';
    if (days <= 14) return 'border-l-4 border-yellow-500';
    return '';
};

const getBadgeColor = (days: number | null): string => {
    if (days === null) return 'text-gray-500';
    if (days <= 7) return 'text-red-400';
    if (days <= 14) return 'text-yellow-400';
    return 'text-green-400';
};

interface Props {
    business: Business;
    onClick: () => void;
}

export const BusinessListItem = ({ business, onClick }: Props) => {
    const days = getDaysUntilInspection(business.lastInspectionDate);

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors rounded-xl px-5 py-4 text-left ${getRowColor(days)}`}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faBuilding} className="text-gray-300" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs font-mono">#{business.customId}</span>
                        <span className="text-white font-semibold">{business.name}</span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{business.type}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{business.ownerName} · {business.address}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                {days !== null && days <= 14 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${getBadgeColor(days)}`}>
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        {days <= 0 ? 'Kontrola przeterminowana' : `Kontrola za ${days} dni`}
                    </div>
                )}
                {business.lastInspectionDate && (
                    <p className="text-gray-500 text-xs mt-0.5">
                        Ostatnia: {new Date(business.lastInspectionDate).toLocaleDateString('pl-PL')}
                    </p>
                )}
            </div>
        </button>
    );
};