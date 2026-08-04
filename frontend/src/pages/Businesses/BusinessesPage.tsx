import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import config from '../../utils/config.ts';
import { usePermission } from '../../hooks/usePermission.ts';
import { SearchInput } from '../../components/ui/SearchInput.tsx';
import { FilterButtons } from '../../components/ui/FilterButtons.tsx';
import { PageHeader } from '../../components/ui/PageHeader.tsx';
import { BusinessListItem } from '../../components/businesses/BusinessListItem.tsx';
import { AddBusinessModal } from '../../components/businesses/AddBusinessModal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';

interface Business {
    _id: string;
    customId: number;
    type: string;
    name: string;
    ownerName: string;
    ownerPhone: string;
    address: string;
    website?: string | null;
    lastInspectionDate?: string | null;
    lastControlPassed?: boolean | null;
    activeNov?: {
        deadlineDate: string;
        deadlineDays: 7 | 14;
    } | null;
}

type FilterMode = 'all' | '7days' | '14days' | 'nov';

const FILTER_OPTIONS = [
    { value: 'all' as FilterMode, label: 'Wszystkie' },
    { value: '7days' as FilterMode, label: '< 7 dni' },
    { value: '14days' as FilterMode, label: '< 14 dni' },
    { value: 'nov' as FilterMode, label: 'NOV aktywny' },
];

const PER_PAGE = 8;

const getDaysUntilInspection = (lastDate?: string | null): number | null => {
    if (!lastDate) return null;
    const next = new Date(lastDate);
    next.setDate(next.getDate() + 60);
    return Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const getDaysUntilNovDeadline = (activeNov?: { deadlineDate: string } | null): number | null => {
    if (!activeNov?.deadlineDate) return null;
    return Math.ceil((new Date(activeNov.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

// Pilność biznesu do sortowania (niższy = pilniejszy)
const getUrgency = (b: Business): number => {
    // Niezaliczona kontrola z aktywnym NOV — najwyższy priorytet
    if (b.lastControlPassed === false) {
        const novDays = getDaysUntilNovDeadline(b.activeNov);
        if (novDays === null) return 10; // niezaliczona bez NOV
        if (novDays <= 0) return 0;      // przedawniona
        if (novDays <= 3) return 1;
        return 2;
    }
    // Zaliczona — standardowe 60 dni
    const d = getDaysUntilInspection(b.lastInspectionDate);
    if (d === null) return 11;           // brak kontroli
    if (d <= 0) return 3;
    if (d <= 7) return 4;
    if (d <= 14) return 5;
    return 6;
};

export const BusinessesPage = () => {
    const navigate = useNavigate();
    const canAdd = usePermission('canAddBusiness');

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterMode>('all');
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);

    const fetchBusinesses = async () => {
        try {
            const res = await fetch(`${config.URL}/businesses`, { credentials: 'include' });
            setBusinesses(await res.json());
        } catch {
            toast.error('Nie można załadować listy biznesów');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBusinesses(); }, []);
    useEffect(() => { setPage(1); }, [search, filter]);

    const sortedAndFiltered = useMemo(() => {
        let list = businesses;

        if (search.trim()) {
            list = list.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
        }

        if (filter === '7days') {
            list = list.filter(b => {
                if (b.lastControlPassed === false) return false; // NOV to nie "za 7 dni"
                const d = getDaysUntilInspection(b.lastInspectionDate);
                return d !== null && d <= 7;
            });
        } else if (filter === '14days') {
            list = list.filter(b => {
                if (b.lastControlPassed === false) return false;
                const d = getDaysUntilInspection(b.lastInspectionDate);
                return d !== null && d <= 14;
            });
        } else if (filter === 'nov') {
            list = list.filter(b => {
                if (!b.activeNov?.deadlineDate) return false;
                const daysLeft = getDaysUntilNovDeadline(b.activeNov);
                return daysLeft !== null && daysLeft > 0;
            });
        }

        return [...list].sort((a, b) => {
            const urgencyA = getUrgency(a);
            const urgencyB = getUrgency(b);
            if (urgencyA !== urgencyB) return urgencyA - urgencyB;
            // Przy tym samym priorytecie — sortuj po dniach rosnąco
            const dA = a.lastControlPassed === false
                ? getDaysUntilNovDeadline(a.activeNov) ?? 999
                : getDaysUntilInspection(a.lastInspectionDate) ?? 999;
            const dB = b.lastControlPassed === false
                ? getDaysUntilNovDeadline(b.activeNov) ?? 999
                : getDaysUntilInspection(b.lastInspectionDate) ?? 999;
            if (dA !== dB) return dA - dB;
            return a.customId - b.customId;
        });
    }, [businesses, search, filter]);

    const totalPages = Math.max(1, Math.ceil(sortedAndFiltered.length / PER_PAGE));
    const paged = sortedAndFiltered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader
                title="Lista biznesów"
                actionLabel="Dodaj biznes"
                onAction={() => setShowModal(true)}
                showAction={canAdd}
            />

            <div className="flex gap-3 mb-5 flex-wrap">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Szukaj po nazwie..."
                />
                <FilterButtons
                    options={FILTER_OPTIONS}
                    value={filter}
                    onChange={setFilter}
                />
            </div>

            {loading ? (
                <p className="text-gray-400 text-center py-12">Ładowanie...</p>
            ) : (
                <>
                    <div className="flex flex-col gap-2">
                        {paged.length === 0 && (
                            <p className="text-gray-400 text-center py-12">Brak biznesów</p>
                        )}
                        {paged.map(business => (
                            <BusinessListItem
                                key={business._id}
                                business={business}
                                onClick={() => navigate(`/businesses/${business._id}`)}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPrev={() => setPage(p => p - 1)}
                                onNext={() => setPage(p => p + 1)}
                            />
                        </div>
                    )}
                </>
            )}

            <AddBusinessModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchBusinesses}
            />
        </div>
    );
};