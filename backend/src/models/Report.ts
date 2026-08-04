import mongoose, { Schema, Document } from 'mongoose';

export type ControlType = 'Planowana' | 'Nieplanowana';

export interface IReport extends Document {
    reportId: string;
    businessId: mongoose.Types.ObjectId;
    businessCustomId: number;
    controlDate: Date;
    inspector: string;
    controlPassed: boolean;
    novIssued?: boolean;
    controlDescription: string;
    alarmServices: boolean;
    controlType: ControlType;
}

const ReportSchema = new Schema<IReport>({
    reportId: { type: String, unique: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    businessCustomId: { type: Number, required: true },
    controlDate: { type: Date, default: Date.now },
    inspector: { type: String, required: true },
    controlPassed: { type: Boolean, default: false },
    novIssued: { type: Boolean, default: false },
    controlDescription: { type: String, required: true },
    alarmServices: { type: Boolean, default: false },
    controlType: { type: String, enum: ['Planowana', 'Nieplanowana'], required: true },
});

ReportSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            const reportCount = await mongoose.model('Report').countDocuments({
                businessId: this.businessId,
            });

            const nextReportNumber = reportCount + 1;
            const formattedNumber = String(nextReportNumber).padStart(3, '0');

            this.reportId = `R${formattedNumber}-${this.businessCustomId}`;
        } catch (err) {
            console.error('Błąd podczas generowania reportId:', err);
            throw err;
        }
    }
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);