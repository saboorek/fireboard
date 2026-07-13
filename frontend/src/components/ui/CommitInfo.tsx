import { useEffect, useState } from 'react';

export const CommitInfo = () => {
    const [commit, setCommit] = useState<string | null>(null);
    const [release, setRelease] = useState('R1.0');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommit = async () => {
            try {
                const response = await fetch(
                    'https://api.github.com/repos/saboorek/fireboard/commits/master',
                    {
                        headers: {
                            'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Commit API Error: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.sha) {
                    setCommit(data.sha.slice(0, 7));
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
            fetch('https://api.github.com/repos/saboorek/fireboard/releases/latest', {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
                }
            })
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