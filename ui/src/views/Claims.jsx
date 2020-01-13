import React, { useEffect, useState, useMemo } from 'react';

import Page from './Page';
import { Link } from 'react-router-dom';

const euros = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });

const tabs = {
    created: 'Luotu',
    approved: 'Hyväksytty',
    paid: 'Maksettu',
    rejected: 'Hylätty',
};

const Claims = props => {
    const [claims, setClaims] = useState([]);
    const [tab, setTab] = useState('created');

    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/claims')
            .then(res => res.json())
            .then(setClaims)
    }, [setClaims]);

    const data = useMemo(() => claims.filter(
        claim => claim.status === tab && (admin || claim.author === 'admin')
    ), [claims, tab, admin]);

    return (
        <Page title="Kulukorvaukset" actions={<React.Fragment>
            <label className="form-switch">
                <input checked={admin} onChange={e => setAdmin(e.target.checked)} type="checkbox" />
                <i className="form-icon"></i> Hallinnoi
                </label>
            <Link to="/claims/new" className="btn btn-primary">Luo uusi</Link>
        </React.Fragment>}>
            <ul className="tab">
                {Object.entries(tabs).map(([key, title]) => (
                    <li key={key} className={'tab-item ' + (tab === key && 'active')}>
                        <a onClick={() => setTab(key)} className="c-hand">{title}</a>
                    </li>
                ))}
            </ul>
            <table style={{ tableLayout: 'fixed' }} className="w-full max-w-3xl text-left table">
                <thead>
                    <tr>
                        <th style={{ width: 100 }}>Luotu</th>
                        <th>Kuvaus</th>
                        <th style={{ width: 100, textAlign: 'right' }}>Summa</th>
                        <th style={{ width: 150 }}>Rahan lähde</th>
                        {admin && <th style={{ width: 150 }}>Käyttäjä</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map(claim => (
                        <tr key={claim.id}>
                            <td>{claim.createdAt}</td>
                            <td><Link to={'/claims/' + claim.id}>{claim.description}</Link></td>
                            <td style={{ textAlign: 'right' }}>{euros.format(claim.amount)}</td>
                            <td>{claim.sourceOfMoney}</td>
                            {admin && <td>{claim.author}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
            {!data.length && <div className="empty">
                <div className="empty-icon">
                    <i className="icon icon-3x icon-more-horiz"></i>
                </div>
                <p className="empty-title h5">Ei kulukorvauksia</p>
            </div>}
        </Page>
    );
};

export default Claims;
