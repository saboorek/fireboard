import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faScrewdriverWrench, faChevronDown, faChevronUp,
    faPlus, faPen, faTrash, faXmark, faCheck,
} from '@fortawesome/free-solid-svg-icons';
import config from '../utils/config';
import { usePermission } from '../hooks/usePermission';

interface CitationParam {
    _id: string;
    description: string;
    amount: number;
}

export const ManageParameters = () => {
    const canEditCitations = usePermission('canEditCitationParameters');

    const [citationOpen, setCitationOpen] = useState(false);
    const [params, setParams] = useState<CitationParam[]>([]);
    const [loadingParams, setLoadingParams] = useState(false);

    // Stan formularza dodawania
    const [addDesc, setAddDesc] = useState('');
    const [addAmount, setAddAmount] = useState('');
    const [adding, setAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // Stan edycji inline
    const [editId, setEditId] = useState<string | null>(null);
    const [editDesc, setEditDesc] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchParams = async () => {
        setLoadingParams(true);
        try {
            const res = await fetch(`${config.URL}/citation-parameters`, { credentials: 'include' });
            setParams(await res.json());
        } catch {
            toast.error('Nie można załadować parametrów');
        } finally {
            setLoadingParams(false);
        }
    };

    useEffect(() => {
        if (citationOpen && params.length === 0) fetchParams();
    }, [citationOpen]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await fetch(`${config.URL}/citation-parameters`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: addDesc, amount: Number(addAmount) }),
            });
            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message);
                return;
            }
            toast.success('Parametr dodany');
            setAddDesc('');
            setAddAmount('');
            setShowAddForm(false);
            await fetchParams();
        } catch {
            toast.error('Błąd serwera');
        } finally {
            setAdding(false);
        }
    };

    const startEdit = (param: CitationParam) => {
        setEditId(param._id);
        setEditDesc(param.description);
        setEditAmount(String(param.amount));
    };

    const handleSaveEdit = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`${config.URL}/citation-parameters/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: editDesc, amount: Number(editAmount) }),
            });
            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message);
                return;
            }
            toast.success('Zapisano zmiany');
            setEditId(null);
            await fetchParams();
        } catch {
            toast.error('Błąd serwera');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten parametr?')) return;
        try {
            const res = await fetch(`${config.URL}/citation-parameters/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error();
            toast.success('Parametr usunięty');
            await fetchParams();
        } catch {
            toast.error('Nie udało się usunąć parametru');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faScrewdriverWrench} className="text-red-500 text-xl" />
                <h1 className="text-2xl font-bold text-white">Zarządzanie parametrami</h1>
            </div>

            <div className="flex flex-col gap-3">
                {/* Sekcja parametrów cytacji */}
                {canEditCitations && (
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        {/* Nagłówek sekcji — kliknięcie rozwija */}
                        <button
                            onClick={() => setCitationOpen(o => !o)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-white font-semibold">Parametry cytacji</span>
                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                    {params.length} pozycji
                                </span>
                            </div>
                            <FontAwesomeIcon
                                icon={citationOpen ? faChevronUp : faChevronDown}
                                className="text-gray-400 text-sm"
                            />
                        </button>

                        {/* Rozwinięta zawartość */}
                        {citationOpen && (
                            <div className="border-t border-gray-700 px-5 py-4">
                                {loadingParams ? (
                                    <p className="text-gray-500 text-sm py-4 text-center">Ładowanie...</p>
                                ) : (
                                    <>
                                        {/* Tabela parametrów */}
                                        {params.length > 0 && (
                                            <div className="mb-4">
                                                <table className="w-full">
                                                    <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">Opis</th>
                                                        <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider py-2 w-32">Kwota</th>
                                                        <th className="w-20"></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {params.map(param => (
                                                        <tr key={param._id} className="border-b border-gray-800 last:border-0">
                                                            {editId === param._id ? (
                                                                <>
                                                                    <td className="py-2 pr-3">
                                                                        <input
                                                                            type="text"
                                                                            value={editDesc}
                                                                            onChange={e => setEditDesc(e.target.value)}
                                                                            className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-600"
                                                                        />
                                                                    </td>
                                                                    <td className="py-2 pr-3">
                                                                        <input
                                                                            type="number"
                                                                            value={editAmount}
                                                                            onChange={e => setEditAmount(e.target.value)}
                                                                            className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-600 text-right"
                                                                        />
                                                                    </td>
                                                                    <td className="py-2">
                                                                        <div className="flex items-center gap-1 justify-end">
                                                                            <button
                                                                                onClick={() => handleSaveEdit(param._id)}
                                                                                disabled={saving}
                                                                                className="p-1.5 rounded bg-green-700 hover:bg-green-600 text-white transition-colors"
                                                                                title="Zapisz"
                                                                            >
                                                                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditId(null)}
                                                                                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                                                                                title="Anuluj"
                                                                            >
                                                                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="py-2.5 text-white text-sm">{param.description}</td>
                                                                    <td className="py-2.5 text-right text-yellow-300 font-mono text-sm">
                                                                        $ {param.amount.toLocaleString('pl-PL')}
                                                                    </td>
                                                                    <td className="py-2.5">
                                                                        <div className="flex items-center gap-1 justify-end">
                                                                            <button
                                                                                onClick={() => startEdit(param)}
                                                                                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                                                                                title="Edytuj"
                                                                            >
                                                                                <FontAwesomeIcon icon={faPen} className="text-xs" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(param._id)}
                                                                                className="p-1.5 rounded bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white transition-colors"
                                                                                title="Usuń"
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Formularz dodawania */}
                                        {showAddForm ? (
                                            <form onSubmit={handleAdd} className="flex gap-3 items-end mt-2">
                                                <div className="flex-1">
                                                    <label className="text-gray-400 text-xs mb-1 block">Opis naruszenia</label>
                                                    <input
                                                        type="text"
                                                        value={addDesc}
                                                        onChange={e => setAddDesc(e.target.value)}
                                                        placeholder="np. Brak gaśnicy"
                                                        required
                                                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                                                    />
                                                </div>
                                                <div className="w-36">
                                                    <label className="text-gray-400 text-xs mb-1 block">Kwota ($)</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={addAmount}
                                                        onChange={e => setAddAmount(e.target.value)}
                                                        placeholder="500"
                                                        required
                                                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={adding}
                                                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {adding ? 'Dodawanie...' : 'Dodaj'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddForm(false)}
                                                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
                                                >
                                                    Anuluj
                                                </button>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddForm(true)}
                                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-2"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                Dodaj parametr
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!canEditCitations && (
                    <p className="text-gray-500 text-center py-12">Brak dostępu do zarządzania parametrami</p>
                )}
            </div>
        </div>
    );
};