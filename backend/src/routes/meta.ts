import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

// Katalog główny repozytorium (dwa poziomy wyżej niż backend/src lub backend/dist,
// plus jeden wyżej niż backend/ - tam gdzie leży plik VERSION i folder .git).
// Działa identycznie w dev (ts-node-dev z src/routes/meta.ts) i w prod
// (skompilowany dist/routes/meta.js) - w obu przypadkach __dirname jest
// 2 poziomy pod backend/, więc 3x '..' zawsze trafia do repo root.
const repoRoot = join(__dirname, '..', '..', '..');

router.get('/commit', (_req: Request, res: Response) => {
    try {
        // Odczytuje commit FAKTYCZNIE wdrożony na TYM serwerze (git checkout na VPS),
        // a nie najnowszy commit z gałęzi master na GitHubie - dzięki temu staging
        // i produkcja zawsze pokazują właściwy, zgodny ze stanem serwera commit.
        const sha = execSync('git rev-parse --short HEAD', { cwd: repoRoot })
            .toString()
            .trim();
        res.json({ sha });
    } catch (err) {
        console.error('❌ Failed to read local git commit:', err);
        res.status(500).json({ message: 'Failed to read commit info' });
    }
});

router.get('/release', (_req: Request, res: Response) => {
    try {
        // Wersja odczytywana z pliku VERSION w korzeniu repo - podbijana ręcznie
        // przy każdym milestone/wydaniu (np. "1.1.1"), niezależnie od tego czy
        // istnieje formalny GitHub Release z tagiem.
        const version = readFileSync(join(repoRoot, 'VERSION'), 'utf-8').trim();
        res.json({ tag_name: `v${version}` });
    } catch (err) {
        console.error('❌ Failed to read VERSION file:', err);
        res.json({ tag_name: null });
    }
});

export default router;

