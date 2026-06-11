import { DashboardCard } from "../components/ui/DashboardCards.tsx";
import { useSession } from "../hooks/useSession.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

export const Dashboard = () => {
    const { isAuth, loading, user } = useSession();

    const avatarUrl = user?.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null;

    return (
        <div className="relative w-full h-full min-h-screen p-6">
            <div className="flex gap-6 flex-wrap">

                {/* Karta Discord */}
                <DashboardCard title="Połączenie Discord">
                    {loading ? (
                        <p className="text-gray-400 text-sm">Ładowanie...</p>
                    ) : (
                        <div className="flex items-center gap-3 mt-1">
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
                                <p className="text-gray-400 text-xs mt-0.5 font-mono">
                                    @{user?.username}
                                </p>
                            </div>
                        </div>
                    )}
                </DashboardCard>

                {/* Karta Server Stats */}
                <DashboardCard title="Server Stats:">
                    <p className="text-sm">🚀 Client: http://localhost:5173/</p>
                    <p className="text-sm">🚀 Server: http://localhost:5000/</p>
                </DashboardCard>

            </div>
        </div>
    );
}