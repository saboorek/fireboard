import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import config from '../utils/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '../components/ui/Pagination';

interface CitationParam {
    _id: string;
    regCode: string;
    description: string;
    amount: number;
    novDay: number;
}

const PER_PAGE = 15;

export const CitationTable = () => {
    const [params, setParams] = useState<CitationParam[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetch(`${config.URL}/citation-parameters`, { credentials: 'include' })
            .then(r => r.json())
            .then(setParams)
            .catch(() => toast.error('Nie można załadować tabeli cytacji'))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.max(1, Math.ceil(params.length / PER_PAGE));
    const paged = params.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-red-500 text-xl" />
                <h1 className="text-2xl font-bold text-white">Tabela cytacji</h1>
                <span className="text-gray-500 text-sm ml-1">({params.length} pozycji)</span>
            </div>

            {loading ? (
                <p className="text-gray-400 text-center py-12">Ładowanie...</p>
            ) : params.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Brak zdefiniowanych parametrów cytacji</p>
            ) : (
                <>
                    <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-36">
                                    Kod
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                                    Opis naruszenia
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-32">
                                    Kwota
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-24">
                                    Dni NOV
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {paged.map((param, idx) => (
                                <tr
                                    key={param._id}
                                    className={`border-b border-gray-800 last:border-0 ${idx % 2 === 0 ? '' : 'bg-gray-800/30'}`}
                                >
                                    <td className="px-5 py-3 w-36">
                                            <span className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">
                                                {param.regCode}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3 text-white text-sm">{param.description}</td>
                                    <td className="px-5 py-3 text-right">
                                            <span className="text-yellow-300 font-mono font-medium text-sm">
                                                $ {param.amount.toLocaleString('pl-PL')}
                                            </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {param.novDay === 0 ? (
                                            <span className="text-gray-500 text-xs italic">Bez NOV</span>
                                        ) : (
                                            <span className="text-orange-400 font-mono text-sm">{param.novDay} dni</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
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
        </div>
    );
};