import { useState } from 'react';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGavel, faTrash, faXmark, faUser, faCalendar,
    faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Pagination } from '../ui/Pagination';
import { businessService } from '../../services/businessService';
import type { Citation } from '../../services/businessService';

const ITEMS_PER_PAGE = 5;

interface Props {
    businessId: string;
    citations: Citation[];
    loading: boolean;
    canDelete: boolean;
    onRefresh: () => Promise<void>;
}

export const BusinessCitations = ({ businessId, citations, loading, canDelete, onRefresh }: Props) => {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Citation | null>(null);
    const [deleting, setDeleting] = useState(false);

    const sorted = [...citations].sort((a, b) => b.citationId.localeCompare(a.citationId));
    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleDelete = async () => {
        if (!selected) return;
        if (!confirm('Czy na pewno chcesz usunąć tę cytację?')) return;
        setDeleting(true);
        try {
            const res = await businessService.deleteCitation(businessId, selected._id);
            if (!res.ok) throw new Error();
            toast.success('Cytacja została usunięta');
            setSelected(null);
            await onRefresh();
            setPage(prev => {
                const newTotal = Math.ceil((citations.length - 1) / ITEMS_PER_PAGE);
                return prev > newTotal && newTotal > 0 ? newTotal : prev;
            });
        } catch {
            toast.error('Nie udało się usunąć cytacji');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-gray-900 rounded-xl p-5">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    <FontAwesomeIcon icon={faGavel} className="mr-2" />
                    Nałożone cytacje
                    {citations.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500">({citations.length})</span>
                    )}
                </h2>
                {loading ? (
                    <p className="text-gray-500 text-sm">Ładowanie...</p>
                ) : citations.length === 0 ? (
                    <p className="text-gray-500 text-sm">Brak cytacji</p>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            {paged.map(citation => (
                                <button
                                    key={citation._id}
                                    onClick={() => setSelected(citation)}
                                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 text-left transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xs font-mono text-gray-400 shrink-0">
                                                {citation.citationId}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-900 text-yellow-300 shrink-0">
                                                ${citation.citationAmount.toLocaleString('pl-PL')}
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-gray-400 text-xs">
                                                {new Date(citation.citationDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                            <p className="text-gray-500 text-xs">{citation.inspector}</p>
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

            {/* Modal szczegółów cytacji */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} className="relative z-50">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg p-6">
                        {selected && (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <DialogTitle className="text-lg font-bold text-white">
                                        {selected.citationId}
                                    </DialogTitle>
                                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3 mb-5">
                                    {/* Kwota */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faDollarSign} className="text-gray-500 w-4 shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Kwota cytacji</p>
                                            <p className="text-yellow-300 text-sm font-medium">
                                                ${selected.citationAmount.toLocaleString('pl-PL')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Data */}
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faCalendar} className="text-gray-500 w-4 shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Data wystawienia</p>
                                            <p className="text-white text-sm">
                                                {new Date(selected.citationDate).toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' })}
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

                                    {/* Opis */}
                                    <div className="border-t border-gray-700 pt-3 mt-1">
                                        <p className="text-gray-500 text-xs mb-1">Opis cytacji</p>
                                        <p className="text-white text-sm whitespace-pre-wrap">{selected.citationReason}</p>
                                    </div>
                                </div>

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
                                            {deleting ? 'Usuwanie...' : 'Usuń cytację'}
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