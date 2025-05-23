import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "../../layouts/Layout.tsx";

// --- Page Import -- //
import { Dashboard } from "../../pages/Dashboard/Dashboard.tsx";
// --- --- //

function Router() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/dashboard" element= { <Dashboard /> }></Route>
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}
export default Router;