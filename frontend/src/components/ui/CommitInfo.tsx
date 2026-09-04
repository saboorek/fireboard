import { useEffect, useState } from 'react';
import config from '../../utils/config';

export const CommitInfo = () => {
    const [commit, setCommit] = useState<string | null>(null);
    const [release, setRelease] = useState('R1.0');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommit = async () => {
            try {
                const response = await fetch(`${config.URL}/meta/commit`, { credentials: 'include' });

                if (!response.ok) {
                    throw new Error(`Commit API Error: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.sha) {
                    setCommit(data.sha);
                }
            } catch (err) {
                console.error("Błąd pobierania commita:", err);
                setError("Błąd commit");
            }
        };

        fetchCommit();
    }, []);

    useEffect(() => {
        if (window.location.hostname !== 'localhost') {
            fetch(`${config.URL}/meta/release`, { credentials: 'include' })
                .then(r => {
                    if (!r.ok) return null; // Jeśli nie ma release, nie wywalaj błędu
                    return r.json();
                })
                .then(data => {
                    if (data && data.tag_name) {
                        setRelease(data.tag_name);
                    }
                })
                .catch(err => console.error("Error fetching release data:", err));
        }
    }, []);


    return (
        <div className="text-center text-xs text-gray-500 break-words py-2">
            <p>Wersja: <span className="text-gray-400 font-semibold">{release}</span></p>
            <p>Commit: <span className="text-gray-400 font-semibold">
                {error ? error : (commit ?? 'Ładowanie...')}
            </span></p>
            <p>Autor: <span className="text-gray-400 font-semibold">SBRK</span></p>
        </div>
    );
};