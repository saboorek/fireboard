import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useCharacter } from '../context/CharacterContext';
import { CharacterSelectModal } from '../components/ui/CharacterSelectModal';

export const ProtectedRoute = () => {
    const { loading, isAuth, authorized } = useSession();
    const { selectedCharacter } = useCharacter();

    if (loading) {
        // Czekaj na odpowiedź sesji — unikasz błysku przekierowania
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                Ładowanie...
            </div>
        );
    }

    // Brak sesji Discord → strona logowania
    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    // Zalogowany, ale bez rangi LSCoFD Staff → noAuth
    if (!authorized) {
        return <Navigate to="/no-auth" replace />;
    }

    // Ma rangę, ale nie wybrał postaci → zablokuj popupem
    return (
        <>
            {!selectedCharacter && <CharacterSelectModal />}
            <Outlet />
        </>
    );
};