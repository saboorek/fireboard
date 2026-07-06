import mongoose, { Schema, Document } from 'mongoose';

export interface ICitationParameters extends Document {
    description: string;
    amount: number;
}

const CitationParameterSchema = new Schema<ICitationParameters>({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
});

export const CitationParameters = mongoose.model<ICitationParameters>('CitationParameters', CitationParameterSchema);