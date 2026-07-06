import { useState } from 'react';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '../ui/Pagination';
import { businessService } from '../../services/businessService';
import type { Note } from '../../services/businessService';

const NOTES_PER_PAGE = 3;

interface Props {
    businessId: string;
    notes: Note[];
    canEdit: boolean;
    canAddNote: boolean;
    onRefresh: () => Promise<void>;
}

export const BusinessNotes = ({ businessId, notes, canEdit, canAddNote, onRefresh }: Props) => {
    const [page, setPage] = useState(1);
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [saving, setSaving] = useState(false);

    const reversedNotes = [...notes].reverse();
    const totalPages = Math.max(1, Math.ceil(reversedNotes.length / NOTES_PER_PAGE));
    const paged = reversedNotes.slice((page - 1) * NOTES_PER_PAGE, page * NOTES_PER_PAGE);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!noteContent.trim()) return;
        setSaving(true);
        try {
            const res = await businessService.addNote(businessId, noteContent.trim());
            if (!res.ok) throw new Error();
            toast.success('Notatka została dodana');
            setNoteContent('');
            setNoteOpen(false);
            setPage(1);
            await onRefresh();
        } catch {
            toast.error('Nie udało się dodać notatki');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (noteId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) return;
        try {
            const res = await businessService.deleteNote(businessId, noteId);
            if (!res.ok) throw new Error();
            toast.success('Notatka została usunięta');
            await onRefresh();
            setPage(prev => {
                const newTotal = Math.ceil((notes.length - 1) / NOTES_PER_PAGE);
                return prev > newTotal && newTotal > 0 ? newTotal : prev;
            });
        } catch {
            toast.error('Nie udało się usunąć notatki');
        }
    };

    return (
        <>
            <div className="bg-gray-900 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faStickyNote} className="mr-2" />
                        Notatki
                        {notes.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-gray-500">({notes.length})</span>
                        )}
                    </h2>
                    {canAddNote && (
                        <button
                            onClick={() => setNoteOpen(true)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Dodaj
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    {notes.length === 0 ? (
                        <p className="text-gray-500 text-sm">Brak notatek</p>
                    ) : (
                        <>
                            {paged.map(note => (
                                <div key={note._id} className="bg-gray-800 rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-white text-sm">{note.content}</p>
                                        {canEdit && (
                                            <button
                                                onClick={() => handleDelete(note._id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
                                                title="Usuń notatkę"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-xs mt-2">
                                        {note.author} · {new Date(note.createdAt).toLocaleDateString('pl-PL')}
                                    </p>
                                </div>
                            ))}
                            {totalPages > 1 && (
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPrev={() => setPage(p => p - 1)}
                                    onNext={() => setPage(p => p + 1)}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <DialogTitle className="text-xl font-bold text-white">Nowa notatka</DialogTitle>
                            <button onClick={() => setNoteOpen(false)} className="text-gray-400 hover:text-white">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="flex flex-col gap-4">
                            <textarea
                                value={noteContent}
                                onChange={e => setNoteContent(e.target.value)}
                                placeholder="Treść notatki..."
                                rows={5}
                                required
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-600 text-sm resize-none"
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setNoteOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">Anuluj</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50 text-sm">
                                    {saving ? 'Zapisywanie...' : 'Dodaj notatkę'}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};