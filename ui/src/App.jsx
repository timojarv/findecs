import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';

import Claims from './views/Claims';
import PurchaseInvoices from './views/PurchaseInvoices';
import Navigation from './Navigation';
import styled from 'styled-components';

const Main = styled.main`
    flex: 1;
    padding: 1rem;

    @media only screen and (min-width: 840px) {
        margin-left: 12rem;
        padding: 3rem;
    }
`

const App = props => {
    return (
        <Router>
            <Navigation />
            <Main>
                <Switch>
                    <Route path="/claims/new"></Route>
                    <Route path="/claims/manage"></Route>
                    <Route path="/claims/approve"></Route>
                    <Route path="/claims">
                        <Claims />
                    </Route>
                    <Route path="/purchaseinvoices/senders"></Route>
                    <Route path="/purchaseinvoices/new"></Route>
                    <Route path="/purchaseinvoices">
                        <PurchaseInvoices />
                    </Route>
                    <Route path="/salesinvoices/new"></Route>
                    <Route path="/salesinvoices"></Route>
                    <Route path="/users/:id"></Route>
                    <Route path="/users"></Route>
                    <Route path="/costpools"></Route>
                    <Route path="/logout"></Route>
                    <Route path="/login"></Route>
                    <Route path="/">
                        <Redirect to="/claims" />
                    </Route>
                </Switch>
            </Main>
        </Router>
    );
};

export default App;
