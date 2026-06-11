export interface Permissions {
    hasAdminAccess:      boolean;
    canManagePermission: boolean;
    hasStatisticAccess:  boolean;
    canEditCharacter:    boolean;
}

export const PERMISSION_LABELS: Record<keyof Permissions, string> = {
    hasAdminAccess:      'Dostęp do panelu administratora',
    canManagePermission: 'Zarządzanie uprawnieniami',
    hasStatisticAccess:  'Dostęp do widoku statystyk',
    canEditCharacter:    'Edycja postaci',
};