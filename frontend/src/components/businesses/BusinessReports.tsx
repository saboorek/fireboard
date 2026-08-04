import { useState } from 'react';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileLines, faCheckCircle, faTimesCircle,
    faBell, faBellSlash, faTrash, faXmark, faUser, faCalendar,
    faClipboardList, faFileShield,
} from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Pagination } from '../ui/Pagination';
import { businessService } from '../../services/businessService';
import type { Report } from '../../services/businessService';

const ITEMS_PER_PAGE = 5;

interface Props {
    businessId: string;
    reports: Report[];
    loading: boolean;
    canDelete: boolean;
    onRefresh: () => Promise<void>;
}

export const BusinessReports = ({ businessId, reports, loading, canDelete, onRefresh }: Props) => {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Report | null>(null);
    const [deleting, setDeleting] = useState(false);

    const sorted = [...reports].sort((a, b) => b.reportId.localeCompare(a.reportId));
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleDelete = async () => {
        if (!selected) return;
        if (!confirm('Czy na pewno chcesz usunąć ten raport?')) return;
        setDeleting(true);
        try {
            const res = await businessService.deleteReport(businessId, selected._id);
            if (!res.ok) throw new Error();
            toast.success('Raport został usunięty');
            setSelected(null);
            await onRefresh();
            setPage(prev => {
                const newTotal = Math.ceil((reports.length - 1) / ITEMS_PER_PAGE);
                return prev > newTotal && newTotal > 0 ? newTotal : prev;
            });
        } catch {
            toast.error('Nie udało się usunąć raportu');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-gray-900 rounded-xl p-5">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    <FontAwesomeIcon icon={faFileLines} className="mr-2" />
                    Raporty z kontroli
                    {reports.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500">({reports.length})</span>
                    )}
                </h2>
                {loading ? (
                    <p className="text-gray-500 text-sm">Ładowanie...</p>
                ) : reports.length === 0 ? (
                    <p className="text-gray-500 text-sm">Brak raportów</p>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            {paged.map(report => (
                                <button
                                    key={report._id}
                                    onClick={() => setSelected(report)}
                                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 text-left transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Lewa strona: ID raportu */}
                                        <span className="text-xs font-mono text-gray-400 shrink-0">
                                            {report.reportId}
                                        </span>

                                        {/* Prawa strona: ikony + data + inspektor */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            {/* Ikona wyniku kontroli */}
                                            <span
                                                title={report.controlPassed ? 'Zaliczona' : 'Niezaliczona'}
                                                className={report.controlPassed ? 'text-green-400' : 'text-red-400'}
                                            >
                                                <FontAwesomeIcon icon={report.controlPassed ? faCheckCircle : faTimesCircle} />
                                            </span>

                                            {/* Ikona alarmu */}
                                            <span
                                                title={report.alarmServices ? 'Serwis Alarmu: Tak' : 'Serwis Alarmu: Nie'}
                                                className={report.alarmServices ? 'text-green-400' : 'text-red-400'}
                                            >
                                                <FontAwesomeIcon icon={report.alarmServices ? faBell : faBellSlash} />
                                            </span>

                                            {/* Ikona NOV — tylko gdy wystawiony */}
                                            {report.novIssued && (
                                                <span title="NOV wystawiony" className="text-red-400">
                                                    <FontAwesomeIcon icon={faFileShield} />
                                                </span>
                                            )}

                                            {/* Data i inspektor */}
                                            <div className="text-right">
                                                <p className="text-gray-400 text-xs">
                                                    {new Date(report.controlDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                                                </p>
                                                <p className="text-gray-500 text-xs">{report.inspector}</p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPrev={() => setPage(p => p - 1)}
                                onNext={() => setPage(p => p + 1)}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Modal szczegółów raportu */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} className="relative z-50">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg p-6">
                        {selected && (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <DialogTitle className="text-lg font-bold text-white">
                                        {selected.reportId}
                                    </DialogTitle>
                                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3 mb-5">
                                    {/* Wynik kontroli */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon
                                            icon={selected.controlPassed ? faCheckCircle : faTimesCircle}
                                            className={`w-4 shrink-0 ${selected.controlPassed ? 'text-green-400' : 'text-red-400'}`}
                                        />
                                        <div>
                                            <p className="text-gray-500 text-xs">Wynik kontroli</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.controlPassed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {selected.controlPassed ? 'Zaliczona' : 'Niezaliczona'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Data */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faCalendar} className="text-gray-500 w-4 shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Data kontroli</p>
                                            <p className="text-white text-sm">
                                                {new Date(selected.controlDate).toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Inspektor */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faUser} className="text-gray-500 w-4 shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Inspektor</p>
                                            <p className="text-white text-sm">{selected.inspector}</p>
                                        </div>
                                    </div>

                                    {/* Typ kontroli */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faClipboardList} className="text-gray-500 w-4 shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Typ kontroli</p>
                                            <p className="text-white text-sm">
                                                {selected.controlType}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Alarm */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faBell} className="text-gray-500 w-4 shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Podbito alarm</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.alarmServices ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {selected.alarmServices ? 'Tak' : 'Nie'}
                                            </span>
                                        </div>
                                    </div>
                                    {selected.novIssued && (
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={faFileShield} className="text-red-400 w-4 shrink-0" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Notice of Violation</p>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-900 text-red-300">
                                                    NOV wystawiony
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Opis */}
                                    <div className="border-t border-gray-700 pt-3 mt-1">
                                        <p className="text-gray-500 text-xs mb-1">Opis kontroli</p>
                                        <p className="text-white text-sm whitespace-pre-wrap">{selected.controlDescription}</p>
                                    </div>
                                </div>

                                {/* Stopka */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="py-2 px-4 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm"
                                    >
                                        Zamknij
                                    </button>
                                    {canDelete && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {deleting ? 'Usuwanie...' : 'Usuń raport'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};