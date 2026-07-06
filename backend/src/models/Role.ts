import mongoose, { Schema, Document } from "mongoose";

export interface IPermissions {
    // === Administracja ===
    hasAdminAccess: boolean;
    canManagePermission: boolean;
    hasStatisticAccess: boolean;
    canEditCharacter: boolean;

    // === Biznesy ===
    hasBusinessesAccess: boolean;
    canAddBusiness: boolean;
    canEditBusiness: boolean;
    canDeleteBusiness: boolean;
    canAddBusinessReport: boolean;
    canDeleteBusinessReport: boolean;
    canAddBusinessCitation: boolean;
    canDeleteBusinessCitation: boolean;
    canAddBusinessNotes: boolean;

    //=== Zarządzanie parametrami ===
    canEditCitationParameters: boolean;
}

export interface IRole extends Document {
    name: string;
    permissions: IPermissions;
    createdAt: Date;
}

const PermissionsSchema = new Schema<IPermissions>({
    hasAdminAccess: { type: Boolean, default: false },
    hasStatisticAccess: { type: Boolean, default: false },
    canManagePermission: { type: Boolean, default: false },
    canEditCharacter: { type: Boolean, default: false },
    hasBusinessesAccess: { type: Boolean, default: false },
    canAddBusiness: { type: Boolean, default: false },
    canEditBusiness: { type: Boolean, default: false },
    canDeleteBusiness: { type: Boolean, default: false },
    canAddBusinessReport: { type: Boolean, default: false },
    canDeleteBusinessReport: { type: Boolean, default: false },
    canAddBusinessCitation: { type: Boolean, default: false },
    canDeleteBusinessCitation: { type: Boolean, default: false },
    canAddBusinessNotes: { type: Boolean, default: false },
    canEditCitationParameters: { type: Boolean, default: false },
}, {_id: false });

const RoleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true, trim: true },
    permissions: { type: PermissionsSchema, default: () => ({})},
    createdAt: { type: Date, default: Date.now },
});

export const Role = mongoose.model<IRole>("Role", RoleSchema);