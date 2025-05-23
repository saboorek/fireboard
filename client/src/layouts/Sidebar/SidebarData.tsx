import {
    faHome,
    faFileInvoiceDollar,
    faBuilding,
    faScrewdriverWrench,
    faMagnifyingGlass,
    faUserTie,
    faUserGear,
    faUser
} from "@fortawesome/free-solid-svg-icons";

export const sidebarItems = [
    {
        type: "item",
        href: "/dashboard",
        icon: faHome,
        title: "Dashboard",
    },
    {
        type: "title",
        title: "Panel Administracyjny",
        children: [
            { href: "/", title: "Zarządzanie parametrami", icon: faScrewdriverWrench },
            { href: "/", title: "Zarządzanie rangami", icon: faUserGear },
            { href: "/", title: "Profile postaci", icon: faUserTie },
            { href: "/", title: "Transkrypty", icon: faMagnifyingGlass },
        ],
    },
    {
        type: "title",
        title: "Human Resources Division",
        children: [
            { href: "/", title: "Pracownicy", icon: faUser },
        ],
    },
    {
        type: "title",
        title: "Fire Prevention Division",
        children: [
            { href: "/businesses", title: "Biznesy", icon: faBuilding },
            { href: "/", title: "Tabela cytacji", icon: faFileInvoiceDollar },
        ],
    },
    {
        type: "title",
        title: "Professional Performance Section",
        children: [
            { href: "/", title: "Lista spraw" },
            { href: "/", title: "Lista pracowników" },
        ],
    },
    {
        type: "title",
        title: "Arson Division",
        children: [
            { href: "/", title: "Lista spraw" },
        ],
    },
];
