import { Router, Request, Response } from 'express';

const router = Router();

const githubHeaders = () => ({
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
});

router.get('/commit', async (_req: Request, res: Response) => {
    try {
        const repo = process.env.GITHUB_REPO;
        const response = await fetch(`https://api.github.com/repos/${repo}/commits/master`, {
            headers: githubHeaders(),
        });

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Failed to fetch commit info' });
        }

        const data = await response.json() as { sha: string };
        res.json({ sha: data.sha?.slice(0, 7) ?? null });
    } catch (err) {
        console.error('❌ Failed to fetch commit info:', err);
        res.status(500).json({ message: 'Failed to fetch commit info' });
    }
});

router.get('/release', async (_req: Request, res: Response) => {
    try {
        const repo = process.env.GITHUB_REPO;
        const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
            headers: githubHeaders(),
        });

        if (!response.ok) {
            return res.json({ tag_name: null });
        }

        const data = await response.json() as { tag_name?: string };
        res.json({ tag_name: data.tag_name ?? null });
    } catch (err) {
        console.error('❌ Failed to fetch release info:', err);
        res.status(500).json({ message: 'Failed to fetch release info' });
    }
});

export default router;

