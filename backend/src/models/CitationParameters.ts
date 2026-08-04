import mongoose, { Schema, Document } from 'mongoose';

export interface ICitationParameters extends Document {
    regCode: string;
    description: string;
    amount: number;
    novDay: number;
}

const CitationParameterSchema = new Schema<ICitationParameters>({
    regCode: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    novDay: { type: Number, required: true, min: 0, default: 0 },
});

export const CitationParameters = mongoose.model<ICitationParameters>('CitationParameters', CitationParameterSchema);