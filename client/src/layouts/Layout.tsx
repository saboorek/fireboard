import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import * as React from "react";

export function Layout({children}: { children: React.ReactNode }) {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";
    const isUnauthorizedPage = location.pathname === "/unauthorized";
    const hide = (isLoginPage || isUnauthorizedPage);
    return (
        <div className="flex min-h-screen h-screen w-full">
            {hide && (
                <div className="flex">
                </div>
            )}
            <div className="flex-1 flex items-center justify-center p-6 w-full">
                {children}
            </div>
        </div>
        )
}
Layout.propTypes = {
    children: PropTypes.node.isRequired,
};