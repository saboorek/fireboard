import { useEffect, useState } from 'react';

export const CommitInfo = () => {
    const [commit, setCommit] = useState<string | null>(null);
    const [release, setRelease] = useState('R1.0');

    useEffect(() => {
        fetch('https://api.github.com/repos/saboorek/fireboard/commits/master')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setCommit(data[0].sha.slice(0, 7));
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (window.location.hostname !== 'localhost') {
            fetch('https://api.github.com/repos/saboorek/fireboard/releases/latest')
                .then(r => r.json())
                .then(data => { if (data.tag_name) setRelease(data.tag_name); })
                .catch(() => {});
        }
    }, []);

    return (
        <div className="text-center text-xs text-gray-500 break-words">
            <p>Wersja: <span className="text-gray-400 font-semibold">{release}</span></p>
            <p>Commit: <span className="text-gray-400 font-semibold">{commit ?? '...'}</span></p>
            <p>Autor: <span className="text-gray-400 font-semibold">SBRK</span></p>
        </div>
    );
};