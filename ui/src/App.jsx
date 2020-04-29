import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import jwtDecode from "jwt-decode";

import CostClaims from "./views/CostClaims";
import CostClaim from "./views/CostClaim";
import Navigation from "./components/Navigation";
import { Box, Alert, AlertIcon } from "@chakra-ui/core";
import CostPools from "./views/CostPools";
import Users from "./views/Users";
import NewUser from "./views/NewUser";
import NewCostClaim from "./views/NewCostClaim";
import EditCostClaim from "./views/EditCostClaim";
import Contacts from "./views/Contacts";
import PurchaseInvoices from "./views/PurhaseInvoices";
import SalesInvoices from "./views/SalesInvoices";
import Import from "./views/Import";
import Login from "./views/Login";
import Version from "./components/Version";
import { AuthContext, tokenStorage } from "./util/auth";

const initial = {};

const App = (props) => {
    const [auth, setAuth] = useState(initial);

    const logout = useCallback(() => {
        tokenStorage.clear();
        setAuth({});
    }, [setAuth]);

    const setToken = useCallback(
        (token) => {
            if (token) {
                try {
                    const user = jwtDecode(token);
                    tokenStorage.set(token);
                    setAuth({
                        id: user.sub,
                        name: user.name,
                        email: user.email,
                    });
                } catch (err) {
                    logout();
                }
            } else {
                logout();
            }
        },
        [setAuth]
    );

    const contextValue = useMemo(() => ({ ...auth, setToken }), [
        auth,
        setToken,
    ]);

    // Try to read persisted token
    useEffect(() => {
        setToken(tokenStorage.get());
    }, [setToken]);

    return (
        <AuthContext.Provider value={contextValue}>
            <Router>
                {process.env.NODE_ENV === "development" ? (
                    <Alert
                        justifyContent="center"
                        width="100%"
                        status="warning"
                    >
                        <AlertIcon />
                        Kehitysversio!
                    </Alert>
                ) : null}

                <Route
                    render={(props) => (
                        <Navigation
                            isAuthenticating={auth === initial}
                            {...props}
                        />
                    )}
                />
                <Box
                    margin="auto"
                    maxWidth="1200px"
                    px={[4, 16]}
                    pt={4}
                    pb={[4, 12]}
                >
                    <Switch>
                        <Route
                            path="/costClaims/new"
                            component={NewCostClaim}
                        ></Route>
                        <Route
                            path="/costClaims/:id/print"
                            component={CostClaim}
                        ></Route>
                        <Route
                            path="/costClaims/:id/edit"
                            component={EditCostClaim}
                        ></Route>
                        <Route
                            path="/costClaims/:id"
                            component={CostClaim}
                        ></Route>
                        <Route
                            path="/costClaims"
                            component={CostClaims}
                        ></Route>
                        <Route path="/purchaseInvoices/new"></Route>
                        <Route
                            path="/purchaseInvoices"
                            component={PurchaseInvoices}
                        ></Route>
                        <Route path="/salesInvoices/new"></Route>
                        <Route
                            path="/salesInvoices"
                            component={SalesInvoices}
                        ></Route>
                        <Route path="/users/new" component={NewUser}></Route>
                        <Route path="/users/:id"></Route>
                        <Route path="/users" component={Users}></Route>
                        <Route path="/costPools" component={CostPools}></Route>
                        <Route path="/contacts" component={Contacts}></Route>
                        <Route path="/login" component={Login}></Route>
                        <Route path="/import" component={Import}></Route>
                        <Redirect to="/costClaims" />
                    </Switch>
                </Box>
                <Version />
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
