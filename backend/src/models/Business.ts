import mongoose, { Schema, Document } from 'mongoose';

export type BusinessType = 'Biznes' | 'Spółka' | 'Projekt IC' | 'Niesprecyzowane';

export interface INote {
    content: string;
    author: string;
    authorId: string;
    createdAt: Date;
}

export interface IActiveNov {
    deadlineDate: Date;
    deadlineDays: 7 | 14;
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
    lastControlPassed?: boolean | null;
    createdAt: Date;
    activeNov?: IActiveNov | null;
}

const NoteSchema = new Schema<INote>({
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });

const ActiveNovSchema = new Schema<IActiveNov>({
    deadlineDate: { type: Date, required: true },
    deadlineDays: { type: Number, enum: [7, 14], required: true },
}, { _id: false });

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
    lastControlPassed: { type: Boolean, default: null },
    createdAt: { type: Date, default: Date.now },
    activeNov: { type: ActiveNovSchema, default: null },
});

BusinessSchema.pre('save', async function () {
    if (this.isNew) {
        const last = await mongoose.model('Business').findOne().sort({ customId: -1 }).lean() as { customId: number } | null;
        this.customId = last ? last.customId + 1 : 1;
    }
});

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);