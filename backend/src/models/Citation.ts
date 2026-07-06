import mongoose, { Schema, Document } from 'mongoose';

export interface ICitation extends Document {
    citationId: string;
    businessId: mongoose.Types.ObjectId;
    businessCustomId: number;
    inspector: string;
    citationDate: Date;
    citationAmount: number;
    citationReason: string;
}

const citationSchema = new Schema<ICitation>({
    citationId: { type: String, unique: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    businessCustomId: { type: Number, required: true },
    inspector: { type: String, required: true },
    citationDate: { type: Date, required: true },
    citationAmount: { type: Number, required: true },
    citationReason: { type: String, required: true },
});

citationSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            const count = await mongoose.model('Citation').countDocuments({
                businessId: this.businessId,
            });
            const formattedNumber = String(count + 1).padStart(3, '0');
            this.citationId = `C${formattedNumber}-${this.businessCustomId}`;
        } catch (err) {
            console.error('Błąd podczas generowania citationId:', err);
            throw err;
        }
    }
});

export const Citation = mongoose.model<ICitation>('Citation', citationSchema);