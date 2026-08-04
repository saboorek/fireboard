import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CitationParameters } from '../models/CitationParameters';

dotenv.config();

async function migrate() {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log('Połączono z bazą');

    const result = await CitationParameters.updateMany(
        { regCode: { $exists: false } },
        { $set: { regCode: 'BRAK', novDay: 0 } }
    );

    console.log(`✅ Zaktualizowano ${result.modifiedCount} dokumentów`);
    await mongoose.disconnect();
}

migrate().catch(console.error);