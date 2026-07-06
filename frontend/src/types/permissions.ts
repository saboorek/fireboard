export interface Permissions {
    hasAdminAccess: boolean;
    canManagePermission: boolean;
    hasStatisticAccess: boolean;
    canEditCharacter: boolean;
    hasBusinessesAccess: boolean;
    canAddBusiness: boolean;
    canEditBusiness: boolean;
    canDeleteBusiness: boolean;
    canAddBusinessReport: boolean;
    canDeleteBusinessReport: boolean;
    canAddBusinessCitation: boolean;
    canDeleteBusinessCitation: boolean;
    canAddBusinessNotes: boolean;
    canEditCitationParameters: boolean;
}

export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
    hasAdminAccess: 'Dostęp do panelu administratora',
    canManagePermission: 'Zarządzanie uprawnieniami',
    hasStatisticAccess: 'Dostęp do widoku statystyk',
    canEditCharacter: 'Edycja postaci',
    hasBusinessesAccess: 'Dostęp do listy biznesów',
    canAddBusiness: 'Dodawanie biznesów',
    canEditBusiness: 'Edytowanie biznesów',
    canDeleteBusiness: 'Usuwanie biznesów',
    canAddBusinessReport: 'Dodawanie raportów z inspekcji',
    canDeleteBusinessReport: 'Usuwanie raportów z inspekcji',
    canAddBusinessCitation: 'Dodawanie cytacji',
    canDeleteBusinessCitation: 'Usuwanie cytacji',
    canAddBusinessNotes: 'Dodawanie notatek do biznesów',
    canEditCitationParameters: 'Edytowanie parametrów cytacji'
};

export const emptyPermissions = (): Permissions =>
    Object.fromEntries(
        Object.keys(PERMISSION_LABELS).map(k => [k, false])
    ) as unknown as Permissions;