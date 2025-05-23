import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { useLocation } from "react-router-dom";
import * as React from "react";


const SidebarItem: React.FC<{ href: string; icon: import("@fortawesome/fontawesome-svg-core").IconProp; label: string }> = ({ href, icon, label }) => {
    //const location = useLocation();
    const isActive = location.pathname === href;

    return (
        <li>
            <a
                href={href}
                className={`flex items-center px-4 py-2 rounded-lg hover:bg-gray-700 ${
                    isActive ? "bg-red-700 text-white" : "text-gray-300"
                }`}
            >
                <FontAwesomeIcon icon={icon} className="mr-3" />
                {label}
            </a>
        </li>
    );
};

export default SidebarItem;
