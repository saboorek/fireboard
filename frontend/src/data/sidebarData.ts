import {
    faHouse,
    faBuilding,
    faFileInvoiceDollar,
    faScrewdriverWrench,
    faUserGear,
    faUserTie,
    faMagnifyingGlass,
    faChartPie,
    faUser,
    faScaleBalanced,
    faFire,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { Permissions } from "../types/permissions";

export interface SidebarChildItem {
    href: string;
    title: string;
    icon?: IconDefinition;
    roles?: string[];
    permission?: keyof Permissions; // ← flaga uprawnienia
}

export interface SidebarItemDef {
    type: 'item' | 'section';
    title: string;
    href?: string;
    icon?: IconDefinition;
    roles?: string[];
    permission?: keyof Permissions; // ← flaga uprawnienia
    children?: SidebarChildItem[];
}

export const sidebarItems: SidebarItemDef[] = [
    {
        type: 'item',
        href: '/dashboard',
        icon: faHouse,
        title: 'Dashboard',
    },
    {
        type: 'section',
        title: 'Panel Administracyjny',
        permission: 'hasAdminAccess',
        children: [
            { href: '/admin/settings', title: 'Zarządzanie parametrami', icon: faScrewdriverWrench, permission: 'hasAdminAccess' },
            { href: '/admin/roles',    title: 'Zarządzanie rangami',     icon: faUserGear,          permission: 'canManagePermission' },
            { href: '/admin/profiles', title: 'Profile postaci',         icon: faUserTie,           permission: 'canEditCharacter' },
            { href: '/admin/logs',     title: 'Transkrypty',             icon: faMagnifyingGlass,   permission: 'hasAdminAccess' },
            { href: '/admin/stats',    title: 'Statystyki',              icon: faChartPie,          permission: 'hasStatisticAccess' },
        ],
    },
    {
        type: 'section',
        title: 'Human Resources Division',
        roles: ['HRD'],
        children: [
            { href: '/hrd/employees', title: 'Pracownicy', icon: faUser },
        ],
    },
    {
        type: 'section',
        title: 'Fire Prevention Division',
        roles: ['FPD'],
        children: [
            { href: '/businesses', title: 'Biznesy',        icon: faBuilding },
            { href: '/citations',  title: 'Tabela cytacji', icon: faFileInvoiceDollar },
        ],
    },
    {
        type: 'section',
        title: 'Professional Performance Section',
        roles: ['PPS'],
        children: [
            { href: '/pps/cases',     title: 'Lista spraw',      icon: faScaleBalanced },
            { href: '/pps/employees', title: 'Lista pracowników', icon: faUser },
        ],
    },
    {
        type: 'section',
        title: 'Arson Division',
        roles: ['PIO'],
        children: [
            { href: '/pio/cases', title: 'Lista spraw', icon: faFire },
        ],
    },
];