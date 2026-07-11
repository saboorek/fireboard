import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPen, faTrash, faFileLines, faGavel, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { usePermission } from '../../hooks/usePermission';
import { useCharacter } from '../../context/CharacterContext';
import { businessService } from '../../services/businessService';
import type { Business, Report, Citation } from '../../services/businessService';
import { BusinessInfo } from '../../components/businesses/BusinessInfo';
import { BusinessNotes } from '../../components/businesses/BusinessNotes';
import { BusinessReports } from '../../components/businesses/BusinessReports';
import { BusinessCitations } from '../../components/businesses/BusinessCitations';
import { AddReportModal } from '../../components/businesses/AddReportModal';
import { AddCitationModal } from '../../components/businesses/AddCitationModal';

const BUSINESS_TYPES = ['Biznes', 'Spółka', 'Projekt IC', 'Niesprecyzowane'];

export const BusinessDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedCharacter } = useCharacter();

    const inspectorName = selectedCharacter
        ? `${selectedCharacter.firstName} ${selectedCharacter.lastName}`
        : '';

    const canEdit = usePermission('canEditBusiness');
    const canDelete = usePermission('canDeleteBusiness');
    const canAddNote = usePermission('canAddBusinessNotes');
    const canAddReport = usePermission('canAddBusinessReport');
    const canAddCitation = usePermission('canAddBusinessCitation');
    const canDeleteReport = usePermission('canDeleteBusinessReport');
    const canDeleteCitation = usePermission('canDeleteBusinessCitation');

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [citations, setCitations] = useState<Citation[]>([]);
    const [citationsLoading, setCitationsLoading] = useState(true);

    const [editOpen, setEditOpen] = useState(false);
    const [editType, setEditType] = useState('');
    const [editName, setEditName] = useState('');
    const [editOwnerName, setEditOwnerName] = useState('');
    const [editOwnerPhone, setEditOwnerPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editWebsite, setEditWebsite] = useState('');
    const [saving, setSaving] = useState(false);

    const [reportOpen, setReportOpen] = useState(false);
    const [citationOpen, setCitationOpen] = useState(false);

    const fetchBusiness = async () => {
        try {
            setBusiness(await businessService.fetchOne(id!));
        } catch {
            toast.error('Nie można załadować biznesu');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            setReports(await businessService.fetchReports(id!));
        } catch {
            toast.error('Nie można załadować raportów');
        } finally {
            setReportsLoading(false);
        }
    };

    const fetchCitations = async () => {
        try {
            setCitations(await businessService.fetchCitations(id!));
        } catch {
            toast.error('Nie można załadować cytacji');
        } finally {
            setCitationsLoading(false);
        }
    };

    useEffect(() => {
        fetchBusiness();
        fetchReports();
        fetchCitations();
    }, [id]);

    const openEdit = () => {
        if (!business) return;
        setEditType(business.type);
        setEditName(business.name);
        setEditOwnerName(business.ownerName);
        setEditOwnerPhone(business.ownerPhone);
        setEditAddress(business.address);
        setEditWebsite(business.website ?? '');
        setEditOpen(true);
    };

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await businessService.update(id!, {
                type: editType,
                name: editName,
                ownerName: editOwnerName,
                ownerPhone: editOwnerPhone,
                address: editAddress,
                website: editWebsite,
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message);
                return;
            }

            toast.success('Dane biznesu zostały zaktualizowane');
            setEditOpen(false);
            await fetchBusiness();
        } catch {
            toast.error('Błąd serwera');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Czy na pewno chcesz usunąć biznes "${business?.name}"?`)) return;
        const res = await businessService.remove(id!);
        if (res.ok) {
            toast.success('Biznes został usunięty');
            navigate('/businesses');
        } else {
            toast.error('Nie udało się usunąć biznesu');
        }
    };

    const handlePhoneFormat = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 7);
        if (digits.length <= 3) setEditOwnerPhone(digits);
        else setEditOwnerPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    };

    const handleReportSuccess = async () => {
        await Promise.all([fetchBusiness(), fetchReports()]);
    };

    if (loading) return <p className="text-gray-400 text-center py-12">Ładowanie...</p>;
    if (!business) return <p className="text-red-400 text-center py-12">Biznes nie znaleziony</p>;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Nagłówek */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-mono text-sm">#{business.customId}</span>
                    <h1 className="text-2xl font-bold text-white">{business.name}</h1>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{business.type}</span>
                </div>
                <div className="flex gap-2">
                    {canAddReport && (
                        <button
                            onClick={() => setReportOpen(true)}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            <FontAwesomeIcon icon={faFileLines} />
                            Dodaj raport
                        </button>
                    )}
                    {canAddCitation && (
                        <button
                            onClick={() => setCitationOpen(true)}
                            className="flex items-center gap-2 bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            <FontAwesomeIcon icon={faGavel} />
                            Dodaj cytację
                        </button>
                    )}
                    {canEdit && (
                        <button onClick={openEdit} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                            <FontAwesomeIcon icon={faPen} />
                            Edytuj
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={handleDelete} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                            <FontAwesomeIcon icon={faTrash} />
                            Usuń
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <BusinessInfo business={business} />

                <BusinessNotes
                    businessId={id!}
                    notes={business.notes}
                    canEdit={canEdit}
                    canAddNote={canAddNote}
                    onRefresh={fetchBusiness}
                />

                <BusinessReports
                    businessId={id!}
                    reports={reports}
                    loading={reportsLoading}
                    canDelete={canDeleteReport}
                    onRefresh={fetchReports}
                />

                <BusinessCitations
                    businessId={id!}
                    citations={citations}
                    loading={citationsLoading}
                    canDelete={canDeleteCitation}
                    onRefresh={fetchCitations}
                />
            </div>

            {/* Modal edycji biznesu */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-5">
                            <DialogTitle className="text-xl font-bold text-white">Edytuj biznes</DialogTitle>
                            <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-white">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Typ biznesu</label>
                                <select value={editType} onChange={e => setEditType(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm">
                                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Nazwa</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Właściciel</label>
                                <input type="text" value={editOwnerName} onChange={e => setEditOwnerName(e.target.value)} required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Telefon</label>
                                <input type="text" value={editOwnerPhone} onChange={e => handlePhoneFormat(e.target.value)} required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Adres</label>
                                <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} required className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Strona internetowa <span className="text-gray-500">(opcjonalne)</span></label>
                                <input type="url" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm" />
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setEditOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">Anuluj</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 text-sm">
                                    {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

            <AddReportModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                businessId={id!}
                inspectorName={inspectorName}
                onSuccess={handleReportSuccess}
            />

            <AddCitationModal
                open={citationOpen}
                onClose={() => setCitationOpen(false)}
                businessId={id!}
                inspectorName={inspectorName}
                onSuccess={fetchCitations}
            />
        </div>
    );
};