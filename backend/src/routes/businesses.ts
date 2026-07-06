import { Router, Request, Response } from 'express';
import { Business } from '../models/Business';
import { Report } from '../models/Report';
import { Citation } from '../models/Citation';
import { isAuthenticated } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { sendDiscordMessage } from '../utils/discord';

const router = Router();

router.get('/', isAuthenticated, requirePermission('hasBusinessesAccess'), async (req: Request, res: Response) => {
    try {
        const businesses = await Business.find().sort({ customId: 1 });
        res.json(businesses);
    } catch (err) {
        console.error('[GET /businesses]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.get('/:id', isAuthenticated, requirePermission('hasBusinessesAccess'), async (req: Request, res: Response) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Biznes nie został znaleziony' });
        res.json(business);
    } catch (err) {
        console.error('[GET /businesses/:id]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/', isAuthenticated, requirePermission('canAddBusiness'), async (req: Request, res: Response) => {
    try {
        const { type, name, ownerName, ownerPhone, address, website } = req.body;

        const existing = await Business.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        if (existing) {
            return res.status(409).json({ message: `Biznes o nazwie "${name}" już istnieje!` });
        }

        const business = new Business({
            type,
            name: name.trim(),
            ownerName: ownerName.trim(),
            ownerPhone: ownerPhone.trim(),
            address: address.trim(),
            website: website?.trim() || null,
        });

        await business.save();

        const user = req.user as any;
        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: '🏢 Nowy biznes został dodany',
            color: 0x57F287,
            fields: [
                { name: 'ID', value: `#${business.customId}`, inline: true },
                { name: 'Nazwa', value: business.name, inline: true },
                { name: 'Typ', value: business.type, inline: true },
                { name: 'Dodany przez', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.status(201).json(business);
    } catch (err) {
        console.error('[POST /business]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.put('/:id', isAuthenticated, requirePermission('canEditBusiness'), async (req: Request, res: Response) => {
    try {
        const { type, name, ownerName, ownerPhone, address, website } = req.body;

        const existing = await Business.findOne({
            _id: { $ne: req.params.id },
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        if (existing) {
            return res.status(409).json({ message: `Biznes o nazwie "${name}" już istnieje` });
        }

        const business = await Business.findByIdAndUpdate(
            req.params.id,
            { type, name: name.trim(), ownerName: ownerName.trim(), ownerPhone: ownerPhone.trim(), address: address.trim(), website: website?.trim() || null },
            { new: true }
        );

        if (!business) return res.status(404).json({ message: 'Biznes nie znaleziony' });

        const user = req.user as any;
        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: '✏️ Biznes został zaktualizowany',
            color: 0xF39C12,
            fields: [
                { name: 'ID', value: `#${business.customId}`, inline: true },
                { name: 'Nazwa', value: business.name, inline: true },
                { name: 'Edytowany przez', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.json(business);
    } catch (err) {
        console.error('[PUT /businesses/:id]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.delete('/:id', isAuthenticated, requirePermission('canDeleteBusiness'), async (req: Request, res: Response) => {
    try {
        const business = await Business.findByIdAndDelete(req.params.id);
        if (!business) return res.status(404).json({ message: 'Biznes nie znaleziony' });

        const user = req.user as any;
        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: '🗑️ Biznes został usunięty',
            color: 0x95A5A6,
            fields: [
                { name: 'ID', value: `#${business.customId}`, inline: true },
                { name: 'Nazwa', value: business.name, inline: true },
                { name: 'Usunięty przez', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.json({ message: 'Biznes usunięty' });
    } catch (err) {
        console.error('[DELETE /businesses/:id]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/:id/notes', isAuthenticated, requirePermission('canAddBusinessNotes'), async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Treść notatki jest wymagana' });
        }

        const business = await Business.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    notes: {
                        content: content.trim(),
                        author: `${(req.session as any).activeCharacter?.firstName} ${(req.session as any).activeCharacter?.lastName}`,
                        authorId: user.id,
                        createdAt: new Date(),
                    }
                }
            },
            { new: true }
        );

        if (!business) return res.status(404).json({ message: 'Biznes nie znaleziony' });
        res.json(business);
    } catch (err) {
        console.error('[POST /businesses/:id/notes]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.delete('/:id/notes/:noteId', isAuthenticated, requirePermission('canEditBusiness'), async (req: Request, res: Response) => {
    try {
        const business = await Business.findByIdAndUpdate(
            req.params.id,
            { $pull: { notes: { _id: req.params.noteId } } },
            { new: true }
        );

        if (!business) return res.status(404).json({ message: 'Biznes nie znaleziony' });
        res.json(business);
    } catch (err) {
        console.error('[DELETE /businesses/:id/notes/:noteId]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.get('/:id/reports', isAuthenticated, requirePermission('hasBusinessesAccess'), async (req: Request, res: Response) => {
    try {
        const reports = await Report.find({ businessId: req.params.id }).sort({ controlDate: -1 });
        res.json(reports);
    } catch (err) {
        console.error('[GET /businesses/:id/reports]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/:id/reports', isAuthenticated, requirePermission('canAddBusinessReport'), async (req: Request, res: Response) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Biznes nie znaleziony' });

        const { controlDate, inspector, controlPassed, controlDescription, alarmServices, controlType } = req.body;

        if (!controlDate || !inspector?.trim() || !controlDescription?.trim() || !controlType) {
            return res.status(400).json({ message: 'Wypełnij wszystkie wymagane pola' });
        }

        const report = new Report({
            businessId: business._id,
            businessCustomId: business.customId,
            controlDate: new Date(controlDate),
            inspector: inspector.trim(),
            controlPassed: Boolean(controlPassed),
            controlDescription: controlDescription.trim(),
            alarmServices: Boolean(alarmServices),
            controlType,
        });

        await report.save();

        await Business.findByIdAndUpdate(req.params.id, {
            lastInspectionDate: new Date(controlDate),
        });

        const user = req.user as any;
        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: '📋 Nowy raport z kontroli',
            color: 0x3498DB,
            fields: [
                { name: 'Biznes', value: `${business.name} (#${business.customId})`, inline: true },
                { name: 'Raport ID', value: report.reportId, inline: true },
                { name: 'Inspektor', value: inspector.trim(), inline: true },
                { name: 'Wynik', value: controlPassed ? '✅ Zaliczona' : '❌ Niezaliczona', inline: true },
                { name: 'Typ', value: controlType, inline: true },
                { name: 'Dodany przez', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.status(201).json(report);
    } catch (err) {
        console.error('[POST /businesses/:id/reports]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.delete('/:id/reports/:reportId', isAuthenticated, requirePermission('canDeleteBusinessReport'), async (req: Request, res: Response) => {
    try {
        const report = await Report.findOneAndDelete({
            _id: req.params.reportId,
            businessId: req.params.id,
        });

        if (!report) return res.status(404).json({ message: 'Raport nie znaleziony' });

        // Zaktualizuj lastInspectionDate na podstawie najnowszego pozostałego raportu
        const latest = await Report.findOne({ businessId: req.params.id }).sort({ controlDate: -1 });
        await Business.findByIdAndUpdate(req.params.id, {
            lastInspectionDate: latest ? latest.controlDate : null,
        });

        res.json({ message: 'Raport usunięty' });
    } catch (err) {
        console.error('[DELETE /businesses/:id/reports/:reportId]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.get('/:id/citations', isAuthenticated, requirePermission('hasBusinessesAccess'), async (req: Request, res: Response) => {
    try {
        const citations = await Citation.find({ businessId: req.params.id }).sort({ citationDate: -1 });
        res.json(citations);
    } catch (err) {
        console.error('[GET /businesses/:id/citations]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/:id/citations', isAuthenticated, requirePermission('canAddBusinessCitation'), async (req: Request, res: Response) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ message: 'Biznes nie znaleziony' });

        const { inspector, citationDate, citationAmount, citationReason } = req.body;

        if (!inspector?.trim() || !citationDate || !citationAmount || !citationReason?.trim()) {
            return res.status(400).json({ message: 'Wypełnij wszystkie wymagane pola' });
        }

        const citation = new Citation({
            businessId: business._id,
            businessCustomId: business.customId,
            inspector: inspector.trim(),
            citationDate: new Date(citationDate),
            citationAmount: Number(citationAmount),
            citationReason: citationReason.trim(),
        });

        await citation.save();

        const user = req.user as any;
        sendDiscordMessage(process.env.DISCORD_CHANNEL_ADMIN_LOGS!, {
            title: '⚖️ Nowa cytacja',
            color: 0xF39C12,
            fields: [
                { name: 'Biznes', value: `${business.name} (#${business.customId})`, inline: true },
                { name: 'Cytacja ID', value: citation.citationId, inline: true },
                { name: 'Inspektor', value: inspector.trim(), inline: true },
                { name: 'Kwota', value: `$${citationAmount}`, inline: true },
                { name: 'Dodana przez', value: `<@${user.id}>`, inline: true },
            ],
            timestamp: new Date().toISOString(),
        });

        res.status(201).json(citation);
    } catch (err) {
        console.error('[POST /businesses/:id/citations]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.delete('/:id/citations/:citationId', isAuthenticated, requirePermission('canDeleteBusinessCitation'), async (req: Request, res: Response) => {
    try {
        const citation = await Citation.findOneAndDelete({
            _id: req.params.citationId,
            businessId: req.params.id,
        });

        if (!citation) return res.status(404).json({ message: 'Cytacja nie znaleziona' });
        res.json({ message: 'Cytacja usunięta' });
    } catch (err) {
        console.error('[DELETE /businesses/:id/citations/:citationId]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

export default router;