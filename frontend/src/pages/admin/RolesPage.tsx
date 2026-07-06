import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import config from '../../utils/config';
import { PERMISSION_LABELS, emptyPermissions } from '../../types/permissions';
import type { Permissions } from '../../types/permissions';
import { useCharacter } from '../../context/CharacterContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Role {
    _id: string;
    name: string;
    permissions: Permissions;
}

const COLUMN_SIZE = 10;

export const RolesPage = () => {
    const { refreshPermissions } = useCharacter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [name, setName] = useState('');
    const [permissions, setPerms] = useState<Permissions>(emptyPermissions());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = () =>
        fetch(`${config.URL}/roles`, { credentials: 'include' })
            .then(r => r.json())
            .then(setRoles)
            .catch(() => toast.error('Nie można załadować ról'));

    useEffect(() => { fetchRoles(); }, []);

    const openCreate = () => {
        setEditRole(null);
        setName('');
        setPerms(emptyPermissions());
        setShowForm(true);
    };

    const openEdit = (role: Role) => {
        setEditRole(role);
        setName(role.name);
        setPerms({ ...emptyPermissions(), ...role.permissions });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const url = editRole ? `${config.URL}/roles/${editRole._id}` : `${config.URL}/roles`;
        const method = editRole ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, permissions }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message);
                toast.error(data.message);
                return;
            }

            await fetchRoles();
            await refreshPermissions();
            setShowForm(false);
            toast.success(editRole ? `Rola "${name}" została zaktualizowana` : `Rola "${name}" została utworzona`);
        } catch {
            toast.error('Błąd serwera');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, roleName: string) => {
        if (!confirm(`Czy na pewno chcesz usunąć rolę "${roleName}"? Zostanie odebrana wszystkim postaciom.`)) return;

        const res = await fetch(`${config.URL}/roles/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (res.ok) {
            toast.success(`Rola "${roleName}" została usunięta`);
            await refreshPermissions();
        } else {
            toast.error('Nie udało się usunąć roli');
        }
        await fetchRoles();
    };

    const togglePerm = (key: keyof Permissions) => {
        setPerms(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const permKeys = Object.keys(PERMISSION_LABELS) as (keyof Permissions)[];
    const columns: (keyof Permissions)[][] = [];
    for (let i = 0; i < permKeys.length; i += COLUMN_SIZE) {
        columns.push(permKeys.slice(i, i + COLUMN_SIZE));
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Zarządzanie uprawnieniami</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Nowa rola
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {roles.map(role => (
                    <div key={role._id} className="bg-gray-900 rounded-xl p-5 flex items-center justify-between">
                        <div>
                            <p className="text-white font-bold text-lg">{role.name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(Object.keys(PERMISSION_LABELS) as (keyof Permissions)[]).map(key => (
                                    role.permissions[key] && (
                                        <span key={key} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full">
                                            {PERMISSION_LABELS[key]}
                                        </span>
                                    )
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                            <button
                                onClick={() => openEdit(role)}
                                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                            >
                                <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                                onClick={() => handleDelete(role._id, role.name)}
                                className="p-2 rounded-lg bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                ))}

                {roles.length === 0 && (
                    <p className="text-gray-400 text-center py-12">Brak zdefiniowanych ról</p>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold text-white mb-5">
                            {editRole ? 'Edytuj rolę' : 'Nowa rola'}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Nazwa roli</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="np. Administrator"
                                    required
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600"
                                />
                            </div>

                            <div>
                                <p className="text-gray-300 text-sm mb-4">Uprawnienia</p>
                                <div
                                    className="gap-x-8"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                                    }}
                                >
                                    {columns.map((col, colIdx) => (
                                        <div key={colIdx} className="flex flex-col gap-5">
                                            {col.map(key => (
                                                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions[key] ?? false}
                                                        onChange={() => togglePerm(key)}
                                                        className="w-4 h-4 mt-0.5 accent-red-600 shrink-0"
                                                    />
                                                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm leading-snug">
                                                        {PERMISSION_LABELS[key]}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Zapisywanie...' : editRole ? 'Zapisz zmiany' : 'Utwórz rolę'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};