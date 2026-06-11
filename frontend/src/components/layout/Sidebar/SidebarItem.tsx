import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Props {
    href:   string;
    label:  string;
    icon?:  IconDefinition;
    indent?: boolean;
}

export const SidebarItem = ({ href, label, icon, indent = false }: Props) => {
    return (
        <li>
            <NavLink
                to={href}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                    ${indent ? 'pl-6' : ''}
                    ${isActive
                        ? 'bg-gradient-to-r from-rose-950 to-red-700 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                }
            >
                {icon && <FontAwesomeIcon icon={icon} className="w-4 shrink-0" />}
                {label}
            </NavLink>
        </li>
    );
};