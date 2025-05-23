import React, { useEffect, useState } from 'react';

export const CommitInfo = () => {
    const [commit, setCommit] = useState<string | null>(null);
    const [release, setRelease] = useState("DEV 1.0.0");

    useEffect(() => {
        const fetchCommit = async () => {
            try {
                const response = await fetch(
                    'https://api.github.com/repos/saboorek/lscofdhqpanel/commits/master'
                );
                const data = await response.json();
                setCommit(data.sha.slice(0, 7));
            } catch (error) {
                console.error('Błąd podczas pobierania commit-u:', error);
            }
        };

        fetchCommit();
    }, []);

    useEffect(() => {
        if (window.location.hostname !== "localhost") {
            fetch("https://api.github.com/repos/saboorek/lscofdhqpanel/releases/latest")
                .then(res => res.json())
                .then(data => setRelease(data.tag_name))
                .catch(err => console.error("Error fetching release data:", err));
        }
    }, []);

    return (
        <div className="py-4 text-center text-xs text-gray-400 px-4 break-words overflow-wrap break-word">
            <p>Wersja: <b>{release}</b></p>
            <p>Commit: <b>{commit || 'Ładowanie...'}</b></p>
            <p>Autor: <b>SBRK</b></p>
        </div>
    );
};
