import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';

import CostClaims from './views/CostClaims';
import CostClaim from './views/CostClaim';
import Navigation from './components/Navigation';
import { Box } from '@chakra-ui/core';
import CostPools from './views/CostPools';
import Users from './views/Users';
import NewUser from './views/NewUser';
import NewCostClaim from './views/NewCostClaim';

const App = (props) => {
    return (
        <Router>
            <Navigation />
            <Box margin="auto" maxWidth="1200px" px={[4, 16]} py={4}>
                <Switch>
                    <Route
                        path="/costClaims/new"
                        component={NewCostClaim}
                    ></Route>
                    <Route
                        path="/costClaims/:id/print"
                        component={CostClaim}
                    ></Route>
                    <Route path="/costClaims/:id/edit"></Route>
                    <Route path="/costClaims/:id" component={CostClaim}></Route>
                    <Route path="/costClaims" component={CostClaims}></Route>
                    <Route path="/purchaseinvoices/senders"></Route>
                    <Route path="/purchaseinvoices/new"></Route>
                    <Route path="/purchaseinvoices"></Route>
                    <Route path="/salesinvoices/new"></Route>
                    <Route path="/salesinvoices"></Route>
                    <Route path="/users/new" component={NewUser}></Route>
                    <Route path="/users/:id"></Route>
                    <Route path="/users" component={Users}></Route>
                    <Route path="/costPools" component={CostPools}></Route>
                    <Route path="/logout"></Route>
                    <Route path="/login"></Route>
                    <Redirect to="/costClaims" />
                </Switch>
            </Box>
        </Router>
    );
};

export default App;
