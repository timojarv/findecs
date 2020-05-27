import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import { Box, Alert, AlertIcon } from "@chakra-ui/core";

import CostClaims from "./views/CostClaim/CostClaims";
import CostClaim from "./views/CostClaim/CostClaim";
import NewCostClaim from "./views/CostClaim/NewCostClaim";
import EditCostClaim from "./views/CostClaim/EditCostClaim";
import PrintCostClaim from "./views/CostClaim/PrintCostClaim";
import Navigation from "./components/Navigation";
import CostPools from "./views/CostPool/CostPools";
import Users from "./views/User/Users";
import NewUser from "./views/User/NewUser";
import Contacts from "./views/Contact/Contacts";
import Contact from "./views/Contact/Contact";
import PurchaseInvoices from "./views/PurchaseInvoice/PurhaseInvoices";
import NewPurchaseInvoice from "./views/PurchaseInvoice/NewPurchaseInvoice";
import SalesInvoices from "./views/SalesInvoice/SalesInvoices";
import NewSalesInvoice from "./views/SalesInvoice/NewSalesInvoice";
import Import from "./views/Import";
import Login from "./views/Login";
import Version from "./components/Version";
import CostPool from "./views/CostPool/CostPool";
import { useQuery } from "urql";
import PurchaseInvoice from "./views/PurchaseInvoice/PurchaseInvoice";
import EditUser from "./views/User/EditUser";
import SalesInvoice from "./views/SalesInvoice/SalesInvoice";
import PrintSalesInvoice from "./views/SalesInvoice/PrintSalesInvoice";
import Settings from "./views/Settings";
import User from "./views/User/User";
import ResetPassword from "./views/ResetPassword";
import EditPurchaseInvoice from "./views/PurchaseInvoice/EditPurchaseInvoice";
import EditSalesInvoice from "./views/SalesInvoice/EditSalesInvoice";

const query = `
    query UserQuery {
        user {
            id
            name
        }
        systemInfo {
            serverVersion
            database
        }
    }
`;

const App = (props) => {
    const { user, setUser } = props;
    const [result] = useQuery({ query });

    const { fetching, data } = result;

    useEffect(() => {
        if (data && !user) setUser(data.user);
    }, [data]);

    if (fetching) return null;

    if (!fetching && !user) {
        return (
            <Router>
                <Switch>
                    <Route
                        path="/resetPassword"
                        component={ResetPassword}
                    ></Route>
                    <Route
                        render={(props) => (
                            <Login setUser={setUser} {...props} />
                        )}
                    ></Route>
                </Switch>
            </Router>
        );
    }

    return (
        <Router>
            {process.env.NODE_ENV === "development" ? (
                <Alert
                    justifyContent="center"
                    width="100%"
                    status="warning"
                    className="no-print"
                >
                    <AlertIcon />
                    Kehitysversio!
                </Alert>
            ) : null}

            <Route
                render={(props) => (
                    <Navigation
                        setUser={setUser}
                        user={(data && data.user) || user}
                        {...props}
                    />
                )}
            />
            <Box margin="auto" maxWidth="1200px" px={[6, 16]} pt={4} pb={12}>
                <Switch>
                    <Route
                        path="/costClaims/new"
                        component={NewCostClaim}
                    ></Route>
                    <Route
                        path="/costClaims/:id/print"
                        component={PrintCostClaim}
                    ></Route>
                    <Route
                        path="/costClaims/:id/edit"
                        component={EditCostClaim}
                    ></Route>
                    <Route path="/costClaims/:id" component={CostClaim}></Route>
                    <Route path="/costClaims" component={CostClaims}></Route>

                    <Route
                        path="/purchaseInvoices/new"
                        component={NewPurchaseInvoice}
                    ></Route>
                    <Route
                        path="/purchaseInvoices/:id/edit"
                        component={EditPurchaseInvoice}
                    ></Route>
                    <Route
                        path="/purchaseInvoices/:id"
                        component={PurchaseInvoice}
                    ></Route>
                    <Route
                        path="/purchaseInvoices"
                        component={PurchaseInvoices}
                    ></Route>

                    <Route
                        path="/salesInvoices/new"
                        component={NewSalesInvoice}
                    ></Route>
                    <Route
                        path="/salesInvoices/:id/print"
                        component={PrintSalesInvoice}
                    ></Route>
                    <Route
                        path="/salesInvoices/:id/edit"
                        component={EditSalesInvoice}
                    ></Route>
                    <Route
                        path="/salesInvoices/:id"
                        component={SalesInvoice}
                    ></Route>
                    <Route
                        path="/salesInvoices"
                        component={SalesInvoices}
                    ></Route>

                    <Route path="/users/new" component={NewUser}></Route>
                    <Route path="/users/:id/edit" component={EditUser}></Route>
                    <Route path="/users/:id" component={User}></Route>
                    <Route path="/users" component={Users}></Route>

                    <Route path="/costPools/:id" component={CostPool}></Route>
                    <Route path="/costPools" component={CostPools}></Route>

                    <Route path="/contacts/:id" component={Contact}></Route>
                    <Route path="/contacts" component={Contacts}></Route>

                    <Route path="/settings" component={Settings}></Route>
                    <Route path="/import" component={Import}></Route>
                    <Redirect to="/costClaims" />
                </Switch>
            </Box>
            <Version info={data && data.systemInfo} />
        </Router>
    );
};

export default App;
