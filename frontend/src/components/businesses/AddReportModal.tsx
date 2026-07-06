import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { businessService } from '../../services/businessService';
import type { AddReportPayload } from '../../services/businessService';

interface Props {
    open: boolean;
    onClose: () => void;
    businessId: string;
    inspectorName: string;
    onSuccess: () => Promise<void>;
}

export const AddReportModal = ({ open, onClose, businessId, inspectorName, onSuccess }: Props) => {
    const now = new Date();

    const [controlDate, setControlDate] = useState(now.toISOString().split('T')[0]);
    const [controlTime, setControlTime] = useState(now.toTimeString().slice(0, 5));
    const [controlPassed, setControlPassed] = useState(false);
    const [description, setDescription] = useState('');
    const [alarmServices, setAlarmServices] = useState(false);
    const [controlType, setControlType] = useState<'Planowana' | 'Nieplanowana'>('Planowana');
    const [saving, setSaving] = useState(false);

    const resetForm = () => {
        const n = new Date();
        setControlDate(n.toISOString().split('T')[0]);
        setControlTime(n.toTimeString().slice(0, 5));
        setControlPassed(false);
        setDescription('');
        setAlarmServices(false);
        setControlType('Planowana');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: AddReportPayload = {
                controlDate: new Date(`${controlDate}T${controlTime}`).toISOString(),
                inspector: inspectorName,
                controlPassed,
                controlDescription: description,
                alarmServices,
                controlType,
            };

            const res = await businessService.addReport(businessId, payload);

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message ?? 'Błąd serwera');
                return;
            }

            toast.success('Raport został zapisany');
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
                <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-5">
                        <DialogTitle className="text-xl font-bold text-white">Nowy raport z kontroli</DialogTitle>
                        <button onClick={handleClose} className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                <label className="text-gray-300 text-sm mb-1 block">Data kontroli</label>
                                <input
                                    type="date"
                                    value={controlDate}
                                    onChange={e => setControlDate(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Godzina kontroli</label>
                                <input
                                    type="time"
                                    value={controlTime}
                                    onChange={e => setControlTime(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                                />
                            </div>
                        </div>

                        {/* Typ kontroli */}
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Typ kontroli</label>
                            <select
                                value={controlType}
                                onChange={e => setControlType(e.target.value as 'Planowana' | 'Nieplanowana')}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                            >
                                <option value="Planowana">Planowana</option>
                                <option value="Nieplanowana">Nieplanowana</option>
                            </select>
                        </div>

                        {/* Opis */}
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Opis kontroli</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Przebieg i uwagi z kontroli..."
                                rows={4}
                                required
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none"
                            />
                        </div>

                        {/* Checkboxy */}
                        <div className="flex flex-col gap-3 pt-1">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={controlPassed}
                                    onChange={e => setControlPassed(e.target.checked)}
                                    className="w-4 h-4 accent-green-500 cursor-pointer"
                                />
                                <span className="text-gray-300 text-sm">Kontrola zaliczona</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={alarmServices}
                                    onChange={e => setAlarmServices(e.target.checked)}
                                    className="w-4 h-4 accent-yellow-500 cursor-pointer"
                                />
                                <span className="text-gray-300 text-sm">Serwis alarmu</span>
                            </label>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={handleClose} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">Anuluj</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50 text-sm">
                                {saving ? 'Zapisywanie...' : 'Zapisz raport'}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};