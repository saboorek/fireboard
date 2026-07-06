import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { businessService } from '../../services/businessService';
import type { AddCitationPayload } from '../../services/businessService';

interface Props {
    open: boolean;
    onClose: () => void;
    businessId: string;
    inspectorName: string;
    onSuccess: () => Promise<void>;
}

export const AddCitationModal = ({ open, onClose, businessId, inspectorName, onSuccess }: Props) => {
    const now = new Date();

    const [citationDate, setCitationDate] = useState(now.toISOString().split('T')[0]);
    const [citationTime, setCitationTime] = useState(now.toTimeString().slice(0, 5));
    const [citationAmount, setCitationAmount] = useState('');
    const [citationReason, setCitationReason] = useState('');
    const [saving, setSaving] = useState(false);

    const resetForm = () => {
        const n = new Date();
        setCitationDate(n.toISOString().split('T')[0]);
        setCitationTime(n.toTimeString().slice(0, 5));
        setCitationAmount('');
        setCitationReason('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: AddCitationPayload = {
                inspector: inspectorName,
                citationDate: new Date(`${citationDate}T${citationTime}`).toISOString(),
                citationAmount: Number(citationAmount),
                citationReason,
            };

            const res = await businessService.addCitation(businessId, payload);

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message ?? 'Błąd serwera');
                return;
            }

            toast.success('Cytacja została wystawiona');
            handleClose();
            await onSuccess();
        } catch {
            toast.error('Błąd serwera');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg p-6">
                    <div className="flex items-center justify-between mb-5">
                        <DialogTitle className="text-xl font-bold text-white">Nowa cytacja</DialogTitle>
                        <button onClick={handleClose} className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Inspektor (readonly) */}
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Inspektor</label>
                            <input
                                type="text"
                                value={inspectorName}
                                readOnly
                                className="w-full bg-gray-800/60 text-gray-400 rounded-lg px-4 py-2 text-sm cursor-not-allowed"
                            />
                        </div>

                        {/* Data i godzina */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Data wystawienia</label>
                                <input
                                    type="date"
                                    value={citationDate}
                                    onChange={e => setCitationDate(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Godzina wystawienia</label>
                                <input
                                    type="time"
                                    value={citationTime}
                                    onChange={e => setCitationTime(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600 text-sm"
                                />
                            </div>
                        </div>

                        {/* Kwota */}
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Kwota cytacji ($)</label>
                            <input
                                type="number"
                                min="1"
                                value={citationAmount}
                                onChange={e => setCitationAmount(e.target.value)}
                                placeholder="np. 500"
                                required
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600 text-sm"
                            />
                        </div>

                        {/* Powód */}
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Opis cytacji</label>
                            <textarea
                                value={citationReason}
                                onChange={e => setCitationReason(e.target.value)}
                                placeholder="Podstawa prawna i opis naruszenia..."
                                rows={4}
                                required
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600 text-sm resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={handleClose} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">Anuluj</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-yellow-700 hover:bg-yellow-600 text-white font-bold transition-colors disabled:opacity-50 text-sm">
                                {saving ? 'Zapisywanie...' : 'Wystaw cytację'}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};