import mongoose, { Schema, Document } from 'mongoose';
import type { IPermissions } from './Role';

export interface IDiscordUser extends Document {
    discordId: string;
    permissions: IPermissions;
}

const DiscordUserSchema: Schema = new Schema<IDiscordUser>({
    discordId: { type: String, required: true, unique: true, index: true },
    permissions: {
        hasAdminAccess: { type: Boolean, default: false },
        hasStatisticsAccess: { type: Boolean, default: false },
        canManagePermission: { type: Boolean, default: false },
        canEditCharacter: { type: Boolean, default: false },
    },
});

export const DiscordUser = mongoose.model<IDiscordUser>('DiscordUser', DiscordUserSchema);