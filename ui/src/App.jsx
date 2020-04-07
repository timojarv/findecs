import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';

import CostClaims from './views/CostClaims';
import CostClaim from './views/CostClaim';
import CostClaimEdit from './views/CostClaimEdit';
import PurchaseInvoices from './views/PurchaseInvoices';
import Navigation from './Navigation';
import styled from 'styled-components';

const Main = styled.main`
    flex: 1;
    padding: 1rem;
    max-width: 1000px;
    overflow: auto;

    @media only screen and (min-width: 840px) {
        margin-left: 14rem;
        padding: 3rem;
    }
`

const App = props => {
    return (
        <Router>
            <Navigation />
            <Main>
                <Switch>
                    <Route path="/costclaims/new"></Route>
                    <Route path="/costclaims/:id/print" component={CostClaim}></Route>
                    <Route path="/costclaims/:id/edit" component={CostClaimEdit}></Route>
                    <Route path="/costclaims/:id" component={CostClaim}></Route>
                    <Route path="/costclaims" component={CostClaims}></Route>
                    <Route path="/purchaseinvoices/senders"></Route>
                    <Route path="/purchaseinvoices/new"></Route>
                    <Route path="/purchaseinvoices" component={PurchaseInvoices}></Route>
                    <Route path="/salesinvoices/new"></Route>
                    <Route path="/salesinvoices"></Route>
                    <Route path="/users/:id"></Route>
                    <Route path="/users"></Route>
                    <Route path="/costpools"></Route>
                    <Route path="/logout"></Route>
                    <Route path="/login"></Route>
                    <Route path="/">
                        <Redirect to="/costclaims" />
                    </Route>
                </Switch>
            </Main>
        </Router>
    );
};

export default App;
