import { useEffect, useState } from 'react';
import { useSession } from "../hooks/useSession.ts";
import { usePermission } from "../hooks/usePermission.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCircle, faTriangleExclamation, faClock, faBuilding, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import config from "../utils/config.ts";

interface DashboardStats {
    total: number;
    typeCount: Record<string, number>;
    expired: number;
    within7: number;
    within14: number;
    citationCount: number;
    citationTotal: number;
}

const TYPE_COLORS: Record<string, string> = {
    'Biznes': '#f97316',
    'Spolka': '#3b82f6',
    'Projekt IC': '#a855f7',
    'Niesprecyzowane': '#6b7280',
};

const PieChart = ({ data, total }: { data: Record<string, number>; total: number }) => {
    const entries = Object.entries(data);
    let cumulative = 0;

    const slices = entries.map(([type, count]) => {
        const pct = count / total;
        const startAngle = cumulative * 2 * Math.PI;
        cumulative += pct;
        const endAngle = cumulative * 2 * Math.PI;

        const x1 = Math.cos(startAngle - Math.PI / 2);
        const y1 = Math.sin(startAngle - Math.PI / 2);
        const x2 = Math.cos(endAngle - Math.PI / 2);
        const y2 = Math.sin(endAngle - Math.PI / 2);
        const largeArc = pct > 0.5 ? 1 : 0;

        const path = total === 1 || pct === 1
            ? `M 0 -1 A 1 1 0 1 1 -0.0001 -1 Z`
            : `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return { type, count, path, color: TYPE_COLORS[type] ?? '#6b7280' };
    });

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-80 h-80">
                    {slices.map(s => (
                        <path key={s.type} d={s.path} fill={s.color} stroke="#1f2937" strokeWidth="0.03" />
                    ))}
                    <circle cx="0" cy="0" r="0.55" fill="#1f2937" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-2xl">{total}</span>
                    <span className="text-gray-400 text-xs">łącznie</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
                {slices.map(s => (
                    <div key={s.type} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-gray-300">{s.type}</span>
                        </div>
                        <span className="text-white font-semibold">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { isAuth, loading, user } = useSession();
    const hasBusinessAccess = usePermission('hasBusinessesAccess');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const avatarUrl = user?.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null;

    useEffect(() => {
        if (!hasBusinessAccess) return;
        setStatsLoading(true);
        fetch(`${config.URL}/businesses/dashboard-stats`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => setStats(data))
            .catch(() => {})
            .finally(() => setStatsLoading(false));
    }, [hasBusinessAccess]);

    return (
        <div className="p-6">
            {/* Górny rząd — info ogólne */}
            <div className="flex gap-4 flex-wrap mb-6">
                <div className="bg-gray-800 text-white p-5 rounded-xl shadow-lg flex-1 min-w-64">
                    <h2 className="text-base font-semibold text-gray-400 mb-3">Połączenie Discord</h2>
                    {loading ? (
                        <p className="text-gray-400 text-sm">Ładowanie...</p>
                    ) : (
                        <div className="flex items-center gap-3">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full" />
                            ) : (
                                <FontAwesomeIcon icon={faDiscord} className="text-indigo-400 text-3xl" />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faCircle}
                                        className={`text-xs ${isAuth ? 'text-green-400' : 'text-red-400'}`}
                                    />
                                    <span className="text-sm font-semibold">
                                        {user?.global_name ?? user?.username ?? 'Nieznany użytkownik'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mt-0.5 font-mono">@{user?.username}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800 text-white p-5 rounded-xl shadow-lg flex-1 min-w-64">
                    <h2 className="text-base font-semibold text-gray-400 mb-3">Server Stats</h2>
                    <p className="text-sm text-gray-300">🚀 Client: {window.location.origin}</p>
                    <p className="text-sm text-gray-300 mt-1">🚀 Server: {config.URL}</p>
                </div>
            </div>

            {/* Dolna sekcja — biznesy */}
            {hasBusinessAccess && (
                <div className="flex gap-4 items-start justify-between flex-wrap">

                    {/* Lewa kolumna — statystyki pionowo */}
                    <div className="flex flex-col gap-4 flex-1 min-w-72 max-w-xs">

                        {/* Stan kontroli */}
                        <div className="bg-gray-800 text-white p-5 rounded-xl shadow-lg">
                            <h2 className="text-base font-semibold text-gray-400 mb-4">Stan kontroli biznesów</h2>
                            {statsLoading ? (
                                <p className="text-gray-400 text-sm">Ładowanie...</p>
                            ) : stats ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 text-red-400">
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-4" />
                                            <span className="text-sm">Nieważne / brak kontroli</span>
                                        </div>
                                        <span className="text-red-300 font-bold text-xl ml-4">{stats.expired}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-orange-950/50 border border-orange-700/50 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 text-orange-400">
                                            <FontAwesomeIcon icon={faClock} className="w-4" />
                                            <span className="text-sm">Kontrola minie w ciągu 7 dni</span>
                                        </div>
                                        <span className="text-orange-300 font-bold text-xl ml-4">{stats.within7}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-yellow-950/50 border border-yellow-700/50 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 text-yellow-400">
                                            <FontAwesomeIcon icon={faClock} className="w-4" />
                                            <span className="text-sm">Kontrola minie w ciągu 14 dni</span>
                                        </div>
                                        <span className="text-yellow-300 font-bold text-xl ml-4">{stats.within14}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Brak danych</p>
                            )}
                        </div>

                        {/* Cytacje */}
                        <div className="bg-gray-800 text-white p-5 rounded-xl shadow-lg">
                            <h2 className="text-base font-semibold text-gray-400 mb-4">Cytacje</h2>
                            {statsLoading ? (
                                <p className="text-gray-400 text-sm">Ładowanie...</p>
                            ) : stats ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between bg-gray-700/60 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <FontAwesomeIcon icon={faBuilding} className="w-4" />
                                            <span className="text-sm">Liczba cytacji</span>
                                        </div>
                                        <span className="text-white font-bold text-xl ml-4">{stats.citationCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-700/60 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-4" />
                                            <span className="text-sm">Łączna kwota</span>
                                        </div>
                                        <span className="text-white font-bold text-xl ml-4">
                                            ${stats.citationTotal.toLocaleString('pl-PL')}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Brak danych</p>
                            )}
                        </div>
                    </div>

                    {/* Prawa kolumna — wykres */}
                    <div className="bg-gray-800 text-white p-5 rounded-xl shadow-lg w-130 shrink-0">
                        <h2 className="text-base font-semibold text-gray-400 mb-4">Biznesy wg typu</h2>
                        {statsLoading ? (
                            <p className="text-gray-400 text-sm">Ładowanie...</p>
                        ) : stats && stats.total > 0 ? (
                            <PieChart data={stats.typeCount} total={stats.total} />
                        ) : (
                            <p className="text-gray-500 text-sm">Brak danych</p>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};