import mongoose, { Schema, Document } from "mongoose";

export interface IPermissions {
    hasAdminAccess: boolean;
    canManagePermission: boolean;
    hasStatisticAccess: boolean;
    canEditCharacter: boolean;
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
}, {_id: false });

const RoleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true, trim: true },
    permissions: { type: PermissionsSchema, default: () => ({})},
    createdAt: { type: Date, default: Date.now },
});

export const Role = mongoose.model<IRole>("Role", RoleSchema);