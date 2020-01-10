import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from 'react-router-dom';

import Dropdown from './Dropdown';
import Claims from './views/Claims';
import Invoices from './views/Invoices';

const App = props => {
    return (
        <Router>
            <header className="navbar" style={{ padding: '1em' }}>
                <section className="navbar-section">
                    <Link to="/" className="navbar-brand text-bold mr-2">
                        Findecs
                    </Link>
                    <span className="text-primary ml-2">Timo Järventausta</span>
                </section>
                <section className="navbar-section">
                    <Dropdown title="Kulukorvaukset">
                        <li className="menu-item">
                            <Link to="/claims">Omat</Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/claims/new">Luo uusi</Link>
                        </li>
                        <li className="divider" data-content="Admin"></li>
                        <li className="menu-item">
                            <Link to="/claims/manage">Hallinnoi</Link>
                        </li>
                    </Dropdown>
                    <Dropdown title="Ostolaskut">
                        <li className="menu-item">
                            <Link to="/invoices/new">Luo uusi</Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/senders">Lähettäjät</Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/invoices">Hallinnoi</Link>
                        </li>
                    </Dropdown>
                    <Dropdown title="Myynti">
                        <li className="menu-item">
                            <Link to="/sales/new">Uusi myyntilasku</Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/sales">Hallinnoi</Link>
                        </li>
                    </Dropdown>
                    <Dropdown title="Asetukset">
                        <li className="menu-item">
                            <Link to="/user/timojarv">Omat asetukset</Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/claims/approve">Hyväksyttävät</Link>
                        </li>
                        <li className="divider" data-content="Admin"></li>
                        <li className="menu-item">
                            <Link to="/users">Käyttäjät</Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/pools">Kustannuspaikat</Link>
                        </li>
                    </Dropdown>
                    <Link to="/logout" style={{ whiteSpace: 'nowrap' }}>
                        Kirjaudu ulos
                    </Link>
                </section>
            </header>
            <Switch>
                <Route path="/claims/new"></Route>
                <Route path="/claims/manage"></Route>
                <Route path="/claims/approve"></Route>
                <Route path="/claims">
                    <Claims />
                </Route>
                <Route path="/senders"></Route>
                <Route path="/invoices/new"></Route>
                <Route path="/invoices">
                    <Invoices />
                </Route>
                <Route path="/sales/new"></Route>
                <Route path="/sales"></Route>
                <Route path="/users/:id"></Route>
                <Route path="/users"></Route>
                <Route path="/pools"></Route>
                <Route path="/logout"></Route>
                <Route path="/login"></Route>
                <Route path="/">
                    <Redirect to="/claims" />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
