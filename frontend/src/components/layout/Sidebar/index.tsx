import fireLogo from '../../../assets/logo/fire.png';
import { SidebarItem } from './SidebarItem.tsx';
import { SidebarSection } from './SidebarSection.tsx';
import { sidebarItems } from '../../../data/sidebarData.ts';
import { useCharacter } from '../../../context/CharacterContext.tsx';
import type { Permissions } from '../../../types/permissions.ts';
import type { SidebarChildItem, SidebarItemDef } from '../../../data/sidebarData.ts';

interface Props {
    isOpen: boolean;
}

export const Sidebar = ({ isOpen }: Props) => {
    const { selectedCharacter } = useCharacter();
    const permissions = selectedCharacter?.permissions;
    const characterRoles = (selectedCharacter?.roles as any[]) ?? [];

    const isVisible = (item: SidebarItemDef | SidebarChildItem): boolean => {
        if (item.permission) {
            return permissions?.[item.permission as keyof Permissions] ?? false;
        }
        if (item.roles && item.roles.length > 0) {
            return item.roles.some(r =>
                characterRoles.some((role: any) => role.name === r)
            );
        }
        return true;
    };

    return (
        <aside className={`flex flex-col h-screen bg-gray-900 border-r border-gray-700/50 shrink-0 transition-all duration-300 overflow-hidden ${
            isOpen ? 'w-64' : 'w-0'
        }`}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 px-6 py-5 border-b border-gray-700/50">
                <img src={fireLogo} alt="Logo" className="h-14 w-auto" />
            </div>

            {/* Nawigacja */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                    {sidebarItems.map((item, idx) => {
                        if (!isVisible(item)) return null;

                        if (item.type === 'item') {
                            return (
                                <SidebarItem
                                    key={idx}
                                    href={item.href!}
                                    label={item.title}
                                    icon={item.icon}
                                />
                            );
                        }

                        if (item.type === 'section' && item.children) {
                            const visibleChildren = item.children.filter(c => isVisible(c));
                            if (visibleChildren.length === 0) return null;

                            return (
                                <SidebarSection
                                    key={idx}
                                    title={item.title}
                                    children={visibleChildren}
                                />
                            );
                        }

                        return null;
                    })}
                </ul>
            </nav>

            {/* Stopka */}
            <div className="border-t border-gray-700/50 px-4 py-3">
                <p className="text-xs text-gray-500 text-center">LSCoFD Fireboard v2.0</p>
            </div>
        </aside>
    );
};