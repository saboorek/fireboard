import { Router, Request, Response } from 'express';
import { Character } from '../models/Character';
import { DiscordUser } from '../models/DiscordUser';
import { Role } from '../models/Role';
import type { IPermissions } from '../models/Role';
import { isAuthenticated } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { sendDiscordMessage } from '../utils/discord';
import { isDeveloper } from '../config/developers';

const router = Router();

// Buduje pusty obiekt uprawnień na podstawie kluczy z bazy (pierwsza rola lub fallback)
async function getEmptyPermissions(): Promise<IPermissions> {
    const sampleRole = await Role.findOne().lean();
    if (sampleRole?.permissions) {
        const empty = {} as IPermissions;
        for (const key of Object.keys(sampleRole.permissions) as (keyof IPermissions)[]) {
            empty[key] = false;
        }
        return empty;
    }
    return {
        hasAdminAccess: false,
        canManagePermission: false,
        hasStatisticAccess: false,
        canEditCharacter: false,
        hasBusinessesAccess: false,
        canAddBusiness: false,
        canEditBusiness: false,
        canDeleteBusiness: false,
        canAddBusinessReport: false,
        canAddBusinessCitation: false,
        canAddBusinessNotes: false,
    };
}

async function getFullPermissions(): Promise<IPermissions> {
    const empty = await getEmptyPermissions();
    return Object.fromEntries(
        Object.keys(empty).map(k => [k, true])
    ) as unknown as IPermissions;
}

// Pobierz postacie zalogowanego użytkownika
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const characters = await Character.find({ discordId: user.id });
        res.json(characters);
    } catch (err) {
        console.error('[GET /characters]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

// Pobierz wszystkie postacie (tylko dla admina)
router.get('/all', isAuthenticated, requirePermission('canEditCharacter'), async (_req: Request, res: Response) => {
    try {
        const characters = await Character.find().populate('roles').sort({ createdAt: -1 });
        res.json(characters);
    } catch (err) {
        console.error('[GET /characters/all]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

// Dodaj nową postać
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const { firstName, lastName } = req.body;

        if (!firstName?.trim() || !lastName?.trim()) {
            return res.status(400).json({ message: 'Imię i nazwisko jest wymagane!' });
        }

        const character = new Character({
            discordId: user.id,
            discordUsername: user.username ?? null,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            roles: [],
        });

        await character.save();

        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: 'ℹ️ Nowa postać została utworzona',
            color: 0x5865F2,
            fields: [
                { name: 'Postać', value: `${character.firstName} ${character.lastName}`, inline: true },
                { name: 'Użytkownik Discord', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.status(201).json(character);
    } catch (err) {
        console.error('[POST /characters]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

// Wybierz aktywną postać — zapisuje do sesji
router.post('/select', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const { characterId } = req.body;

        console.log(`[POST /characters/select] user: ${user.id}, characterId: ${characterId}`);

        const character = await Character.findOne({
            _id: characterId,
            discordId: user.id,
        }).populate('roles');

        if (!character) {
            console.warn(`[POST /characters/select] Postać nie znaleziona lub brak dostępu`);
            return res.status(403).json({ message: 'Brak dostępu do tej postaci' });
        }

        let permissions: IPermissions;

        if (isDeveloper(user.id)) {
            console.log(`[POST /characters/select] Developer detected — full permissions granted`);
            permissions = await getFullPermissions();
        } else {
            permissions = await getEmptyPermissions();

            const discordUser = await DiscordUser.findOne({ discordId: user.id });
            if (discordUser?.permissions) {
                for (const key of Object.keys(permissions) as (keyof IPermissions)[]) {
                    if ((discordUser.permissions as any)[key]) permissions[key] = true;
                }
            }

            for (const role of character.roles as any[]) {
                if (role.permissions) {
                    for (const key of Object.keys(permissions) as (keyof IPermissions)[]) {
                        if (role.permissions[key]) permissions[key] = true;
                    }
                }
            }
        }

        (req.session as any).activeCharacter = {
            id: character._id,
            _id: character._id,
            firstName: character.firstName,
            lastName: character.lastName,
            roles: character.roles,
            permissions,
            avatarUrl: character.avatarUrl ?? null,
        };

        console.log(`[POST /characters/select] Wybrano postać: ${character.firstName} ${character.lastName}`);
        res.json((req.session as any).activeCharacter);
    } catch (err) {
        console.error('[POST /characters/select]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.put('/:id/avatar', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const { avatarUrl } = req.body;

        const character = await Character.findOneAndUpdate(
            { _id: req.params.id, discordId: user.id },
            { avatarUrl: avatarUrl?.trim() || null },
            { returnDocument: 'after', runValidators: true }
        );

        if (!character) return res.status(404).json({ message: 'Postać nie znaleziona' });

        res.json(character);
    } catch (err) {
        console.error(`[PUT /characters/${req.params.id}/avatar]`, err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.put('/:id', isAuthenticated, requirePermission('canEditCharacter'), async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, avatarUrl } = req.body;

        if (!firstName?.trim() || !lastName?.trim()) {
            return res.status(400).json({ message: 'Imię i nazwisko są wymagane' });
        }

        const character = await Character.findByIdAndUpdate(
            req.params.id,
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                avatarUrl: avatarUrl?.trim() || null,
            },
            { returnDocument: 'after', runValidators: true }
        );

        if (!character) return res.status(404).json({ message: 'Postać nie znaleziona' });

        const user = req.user as any;
        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: '✏️ Dane postaci zostały zaktualizowane',
            color: 0xF39C12,
            fields: [
                { name: 'Postać', value: `${character.firstName} ${character.lastName}`, inline: true },
                { name: 'Zmienione przez', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.json(character);
    } catch (err) {
        console.error(`[PUT /characters/${req.params.id}]`, err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

export default router;