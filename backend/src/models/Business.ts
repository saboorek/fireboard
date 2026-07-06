import mongoose, { Schema, Document } from 'mongoose';

export type BusinessType = 'Biznes' | 'Spółka' | 'Projekt IC' | 'Niesprecyzowane';

export interface INote {
    content: string;
    author: string;
    authorId: string;
    createdAt: Date;
}

export interface IBusiness extends Document {
    customId: number;
    type: BusinessType;
    name: string;
    ownerName: string;
    ownerPhone: string;
    address: string;
    website?: string;
    notes: INote[];
    lastInspectionDate?: Date;
    createdAt: Date;
}

const NoteSchema = new Schema<INote>({
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });

const BusinessSchema = new Schema<IBusiness>({
    customId: { type: Number, unique: true },
    type: {
        type: String,
        enum: ['Biznes', 'Spółka', 'Projekt IC', 'Niesprecyzowane'],
        required: true,
    },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerPhone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    website: { type: String, trim: true, default: null },
    notes: [NoteSchema],
    lastInspectionDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
});

BusinessSchema.pre('save', async function () {
    if (this.isNew) {
        const last = await mongoose.model('Business').findOne().sort({ customId: -1 });
        this.customId = last ? (last as IBusiness).customId + 1 : 1;
    }
});

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);