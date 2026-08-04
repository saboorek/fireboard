import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Business } from '../models/Business';
import { Report } from '../models/Report';

dotenv.config();

async function migrate() {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log('Połączono z bazą');

    const businesses = await Business.find({});
    let updated = 0;

    for (const business of businesses) {
        const latest = await Report.findOne({ businessId: business._id }).sort({ controlDate: -1 });
        await Business.findByIdAndUpdate(business._id, {
            lastControlPassed: latest ? latest.controlPassed : null,
        });
        updated++;
        console.log(`[${updated}/${businesses.length}] ${business.name} → lastControlPassed: ${latest?.controlPassed ?? null}`);
    }

    console.log('✅ Migracja zakończona');
    await mongoose.disconnect();
}

migrate().catch(console.error);