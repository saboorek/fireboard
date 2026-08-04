import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faTriangleExclamation, faCircleCheck, faRotateRight } from '@fortawesome/free-solid-svg-icons';

interface Business {
    _id: string;
    customId: number;
    type: string;
    name: string;
    ownerName: string;
    address: string;
    lastInspectionDate?: string | null;
    lastControlPassed?: boolean | null;
    activeNov?: {
        deadlineDate: string;
        deadlineDays: 7 | 14;
    } | null;
}

const getDaysUntilNextInspection = (lastDate?: string | null): number | null => {
    if (!lastDate) return null;
    const next = new Date(lastDate);
    next.setDate(next.getDate() + 60);
    return Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getDaysUntilNovDeadline = (activeNov?: { deadlineDate: string } | null): number | null => {
    if (!activeNov?.deadlineDate) return null;
    return Math.ceil((new Date(activeNov.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getRowColor = (lastControlPassed: boolean | null | undefined, novDays: number | null, inspectionDays: number | null): string => {
    // Ostatnia kontrola niezaliczona — kolor zależy od NOV deadline
    if (lastControlPassed === false) {
        if (novDays === null || novDays <= 0) return 'border-l-4 border-red-500';
        if (novDays <= 3) return 'border-l-4 border-red-500';
        return 'border-l-4 border-orange-500';
    }
    // Ostatnia kontrola zaliczona — standardowe 60 dni
    if (inspectionDays === null) return '';
    if (inspectionDays <= 7) return 'border-l-4 border-red-500';
    if (inspectionDays <= 14) return 'border-l-4 border-yellow-500';
    return 'border-l-4 border-green-500';
};

interface Props {
    business: Business;
    onClick: () => void;
}

export const BusinessListItem = ({ business, onClick }: Props) => {
    const inspectionDays = getDaysUntilNextInspection(business.lastInspectionDate);
    const novDays = getDaysUntilNovDeadline(business.activeNov);
    const lastControlPassed = business.lastControlPassed;

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors rounded-xl px-5 py-4 text-left ${getRowColor(lastControlPassed, novDays, inspectionDays)}`}
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
            <div className="text-right shrink-0 flex flex-col items-end gap-0.5">

                {/* === OSTATNIA KONTROLA NIEZALICZONA → tryb NOV === */}
                {lastControlPassed === false && (
                    <>
                        {novDays === null && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-400">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                Kontrola niezaliczona
                            </div>
                        )}
                        {novDays !== null && novDays > 0 && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-orange-400">
                                <FontAwesomeIcon icon={faRotateRight} />
                                Kontrola poprawkowa za {novDays} {novDays === 1 ? 'dzień' : 'dni'}
                            </div>
                        )}
                        {novDays !== null && novDays <= 0 && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-500">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                Kontrola poprawkowa przedawniona. Wystaw cytację.
                            </div>
                        )}
                    </>
                )}

                {/* === OSTATNIA KONTROLA ZALICZONA lub brak kontroli → tryb normalny 60 dni === */}
                {lastControlPassed !== false && (
                    <>
                        {inspectionDays === null && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                Brak kontroli
                            </div>
                        )}
                        {inspectionDays !== null && inspectionDays <= 0 && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-400">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                Kontrola przeterminowana
                            </div>
                        )}
                        {inspectionDays !== null && inspectionDays > 0 && inspectionDays <= 7 && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-400">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                Kontrola za {inspectionDays} {inspectionDays === 1 ? 'dzień' : 'dni'}
                            </div>
                        )}
                        {inspectionDays !== null && inspectionDays > 7 && inspectionDays <= 14 && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                Kontrola za {inspectionDays} dni
                            </div>
                        )}
                        {inspectionDays !== null && inspectionDays > 14 && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-green-400">
                                <FontAwesomeIcon icon={faCircleCheck} />
                                Kontrola zaliczona
                            </div>
                        )}
                    </>
                )}

                {business.lastInspectionDate && (
                    <p className="text-gray-500 text-xs">
                        Ostatnia: {new Date(business.lastInspectionDate).toLocaleDateString('pl-PL')}
                    </p>
                )}
            </div>
        </button>
    );
};