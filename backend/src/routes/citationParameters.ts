import { Router, Request, Response } from 'express';
import { CitationParameters } from '../models/CitationParameters';
import { isAuthenticated } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

router.get('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const params = await CitationParameters.find().sort({ amount: 1 });
        res.json(params);
    } catch (err) {
        console.error('[GET /citation-parameters]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/', isAuthenticated, requirePermission('canEditCitationParameters'), async (req: Request, res: Response) => {
    try {
        const { description, amount } = req.body;
        if (!description?.trim() || !amount) {
            return res.status(400).json({ message: 'Wypełnij wszystkie pola' });
        }
        const param = new CitationParameters({ description: description.trim(), amount: Number(amount) });
        await param.save();
        res.status(201).json(param);
    } catch (err) {
        console.error('[POST /citation-parameters]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.put('/:id', isAuthenticated, requirePermission('canEditCitationParameters'), async (req: Request, res: Response) => {
    try {
        const { description, amount } = req.body;
        const param = await CitationParameters.findByIdAndUpdate(
            req.params.id,
            { description: description.trim(), amount: Number(amount) },
            { new: true }
        );
        if (!param) return res.status(404).json({ message: 'Parametr nie znaleziony' });
        res.json(param);
    } catch (err) {
        console.error('[PUT /citation-parameters/:id]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.delete('/:id', isAuthenticated, requirePermission('canEditCitationParameters'), async (req: Request, res: Response) => {
    try {
        const param = await CitationParameters.findByIdAndDelete(req.params.id);
        if (!param) return res.status(404).json({ message: 'Parametr nie znaleziony' });
        res.json({ message: 'Usunięto' });
    } catch (err) {
        console.error('[DELETE /citation-parameters/:id]', err);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

export default router;