import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';


import Page from './Page';

const euros = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });

const tabs = {
    created: 'Luotu',
    approved: 'Hyväksytty',
    paid: 'Maksettu',
    rejected: 'Hylätty',
};

const total = invoice => invoice.rows.reduce((t, row) => t + row.amount, 0);

const PurchaseInvoices = props => {
    const [invoices, setInvoices] = useState([]);
    const [tab, setTab] = useState('created');


    useEffect(() => {
        fetch('http://localhost:3000/purchaseInvoices')
            .then(res => res.json())
            .then(setInvoices)
    }, [setInvoices]);

    const data = useMemo(() => invoices.filter(
        invoice => invoice.status === tab
    ), [invoices, tab]);

    return (
        <Page title="Ostolaskut" actions={(
            <React.Fragment>
                <Link to="/purchaseinvoices/senders" className="btn">Lähettäjät</Link>
                <Link to="/purchaseinvoices/new" className="btn btn-primary">Luo uusi</Link>
            </React.Fragment>
        )}>
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
                        <th>Lähettäjä</th>
                        <th>Kuvaus</th>
                        <th>Eräpäivä</th>
                        <th style={{ textAlign: 'right' }}>Summa</th>
                        <th>Huomautus</th>
                        <th>Toiminnot</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(invoice => (
                        <tr key={invoice.id}>
                            <td>{invoice.sender}</td>
                            <td><Link to={'/invoices/' + invoice.id}>{invoice.description}</Link></td>
                            <td>{invoice.dueDate}</td>
                            <td style={{ textAlign: 'right' }}>{euros.format(total(invoice))}</td>
                            <td>{invoice.note}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-action mr-2 tooltip"
                                    data-tooltip="Poista"
                                >
                                    <i className="icon icon-delete"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-action tooltip"
                                    data-tooltip="Muokkaa"
                                >
                                    <i className="icon icon-edit"></i>
                                </button>
                            </td>
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

export default PurchaseInvoices;
