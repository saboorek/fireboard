import { Router, Request, Response } from 'express';
import passport from 'passport';

const router = Router();

async function hasRequiredRole(discordUserId: string): Promise<boolean> {
    const guildId  = process.env.DISCORD_GUILD_ID!;
    const botToken = process.env.DISCORD_BOT_TOKEN!;
    const roleId   = process.env.DISCORD_REQUIRED_ROLE_ID!;

    try {
        const res = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
            { headers: { Authorization: `Bot ${botToken}` } }
        );

        if (!res.ok) return false;

        const member = await res.json() as { roles: string[] };
        return member.roles.includes(roleId);
    } catch {
        return false;
    }
}

router.get('/discord', passport.authenticate('discord'));

router.get(
    '/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: process.env.NODE_ENV === 'production'
            ? `${process.env.FRONTEND_URL}/login`
            : 'http://localhost:5173/login',
    }),
    (_req: Request, res: Response) => {
        const redirectUrl = process.env.NODE_ENV === 'production'
            ? `${process.env.FRONTEND_URL}/dashboard`
            : 'http://localhost:5173/dashboard';
        res.redirect(redirectUrl);
    }
);

router.get('/session', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            message:         'Brak aktywnej sesji',
            isAuthenticated: false,
        });
    }

    const user = req.user as any;
    const authorized = await hasRequiredRole(user.id);

    res.json({
        user,
        isAuthenticated: true,
        authorized,
        activeCharacter: (req.session as any).activeCharacter ?? null,
    });
});

router.post('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Failed to log out' });
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: 'Failed to destroy session' });
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    });
});

export default router;