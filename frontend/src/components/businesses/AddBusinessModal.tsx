import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import config from '../../utils/config';

const BUSINESS_TYPES = ['Biznes', 'Spółka', 'Projekt IC', 'Niesprecyzowane'];

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddBusinessModal = ({ open, onClose, onSuccess }: Props) => {
    const [type, setType] = useState('Biznes');
    const [name, setName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');
    const [address, setAddress] = useState('');
    const [website, setWebsite] = useState('');
    const [saving, setSaving] = useState(false);

    const reset = () => {
        setType('Biznes');
        setName('');
        setOwnerName('');
        setOwnerPhone('');
        setAddress('');
        setWebsite('');
    };

    const handlePhoneFormat = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 7);
        if (digits.length <= 3) setOwnerPhone(digits);
        else setOwnerPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${config.URL}/businesses`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, name, ownerName, ownerPhone, address, website }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message);
                return;
            }

            const newBusiness = await res.json();
            toast.success(`Biznes "${newBusiness.name}" (#${newBusiness.customId}) został dodany`);
            reset();
            onClose();
            onSuccess();
        } catch {
            toast.error('Błąd serwera');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-5">
                        <DialogTitle className="text-xl font-bold text-white">Nowy biznes</DialogTitle>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Typ biznesu</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm">
                                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Nazwa</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="np. Burger Shot" required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Właściciel</label>
                            <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="np. Jan Kowalski" required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Telefon (000-0000)</label>
                            <input type="text" value={ownerPhone} onChange={e => handlePhoneFormat(e.target.value)} placeholder="000-0000" required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Adres</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="np. Vinewood Hills, Los Santos" required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Strona internetowa <span className="text-gray-500">(opcjonalne)</span></label>
                            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">Anuluj</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 text-sm">
                                {saving ? 'Dodawanie...' : 'Dodaj biznes'}
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};