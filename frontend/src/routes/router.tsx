import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { Login } from '../pages/login';
import { Dashboard } from '../pages/dashboard';
import { NoAuth } from '../pages/noAuth';
import { RolesPage } from '../pages/admin/RolesPage';
import { CharactersPage } from '../pages/admin/CharactersPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/no-auth',
        element: <NoAuth />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/dashboard',  element: <Dashboard /> },
                    { path: '/admin/roles', element: <RolesPage /> },
                    { path: '/admin/profiles', element: <CharactersPage /> },
                ],
            },
        ],
    },
]);