import mongoose, { Schema, Document } from 'mongoose';

export interface INOV extends Document {
    businessId: mongoose.Types.ObjectId;
    reportMongoId: mongoose.Types.ObjectId;
    reportRef: string;
    issuedAt: Date;
    deadlineDays: 7 | 14;
    deadlineDate: Date;
    violations: string[];
    issuedBy: string;
}

const NOVSchema = new Schema<INOV>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    reportMongoId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    reportRef: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    deadlineDays: { type: Number, enum: [7, 14], required: true },
    deadlineDate: { type: Date, required: true },
    violations: [{ type: String }],
    issuedBy: { type: String, required: true }
});

export const NOV = mongoose.model<INOV>('NOV', NOVSchema);