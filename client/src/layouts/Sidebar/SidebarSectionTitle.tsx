import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";

const SidebarSectionTitle: React.FC<{
    title: string;
    icon: any;
    children: { href: string; title: string; icon: any }[];
}> = ({ title, icon, children }) => {
    return (
        <Disclosure>
            {({ open }) => (
                <li className="border-b border-gray-700 last:border-none">
                    <Disclosure.Button className="flex w-full items-center justify-between px-4 py-2 text-left text-white hover:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={icon} />
                            <span>{title}</span>
                        </div>
                        <ChevronDownIcon
                            className={`h-5 w-5 transition-transform ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </Disclosure.Button>
                    <Disclosure.Panel className="pl-10 pr-4 py-2 text-sm text-gray-300">
                        <ul className="space-y-1">
                            {children.map((item, idx) => (
                                <li
                                    key={idx}
                                    className={
                                        idx < children.length - 1
                                            ? "border-b border-gray-700 pb-1 mb-1"
                                            : ""
                                    }
                                >
                                    <a
                                        href={item.href}
                                        className="flex items-center gap-2 rounded hover:text-white hover:bg-gray-700 px-2 py-1"
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="w-4" />
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Disclosure.Panel>
                </li>
            )}
        </Disclosure>
    );
};

export default SidebarSectionTitle;
