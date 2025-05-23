import {useState} from "react";
import {Bars3Icon, XMarkIcon} from "@heroicons/react/24/outline";
import logo from "../../assets/logo/fire.png";
import {sidebarItems} from "./SidebarData.tsx";
import SidebarItem from "./SidebarItem.tsx";
import SidebarSectionTitle from "./SidebarSectionTitle.jsx";
import { CommitInfo } from "../../data/CommitInfo.tsx";

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded-md ${
                    isOpen ? "hidden" : "block"
                }`}
            >
                <Bars3Icon className="h-6 w-6"/>
            </button>

            <div
                className={`fixed top-0 left-0 h-full w-72 bg-gray-800 text-white z-40 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } flex flex-col`}
            >
                <div className="flex justify-end px-4 pt-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white bg-gray-700 p-1 rounded"
                    >
                        <XMarkIcon className="h-5 w-5"/>
                    </button>
                </div>

                <div className="flex justify-center items-center py-6 border-b border-gray-700">
                    <img src={logo} alt="Logo" className="h-12 w-auto"/>
                </div>

                <ul className="space-y-2 px-2 overflow-y-auto flex-1">
                    {sidebarItems.map((item, index) => {
                        if (item.type === "item") {
                            return (
                                <SidebarItem
                                    key={index}
                                    href={item.href as string}
                                    icon={item.icon ?? null}
                                    label={item.title}
                                />
                            );
                        }

                        if (item.type === "title" && Array.isArray(item.children)) {
                            return (
                                <SidebarSectionTitle
                                    key={index}
                                    title={item.title}
                                    icon={item.icon}
                                    children={item.children}
                                />
                            );
                        }

                        return null;
                    })}
                </ul>

                <div className="border-t border-gray-700 pt-2">
                    <CommitInfo />
                </div>
            </div>
        </div>
    );
};
