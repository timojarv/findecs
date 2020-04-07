import React, { useEffect, useState, useMemo } from 'react';

import Page from './Page';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Pill, Button, Table, Sortable } from '../base';
import { statuses, statusColors } from '../util/statuses';

const euros = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });

const Switch = styled.label`
    margin-right: 2rem;
    
    input {
        margin-right: 0.25rem;
    }

    span {
        opacity: 0.6;
        transition: opacity 0.3s;
    }

    input:checked + span {
        opacity: 1;
    }
`;

const sortByKey = (key, asc) => (a, b) => {
    if (a[key] === b[key]) {
        return 0;
    }

    if (a[key] < b[key]) {
        return asc ? -1 : 1;
    } else {
        return asc ? 1 : -1;
    }
};

const CostClaims = props => {
    const [claims, setClaims] = useState([]);
    const [admin, setAdmin] = useState(false);
    const [sort, setSort] = useState({ key: 'createdAt', order: 'desc' });

    useEffect(() => {
        fetch('http://localhost:3000/costClaims')
            .then(res => res.json())
            .then(setClaims)
    }, [setClaims]);

    const data = useMemo(() => claims.filter(
        claim => admin || claim.author === 'admin'
    ).sort(sortByKey(sort.key, sort.order === 'asc')), [claims, admin, sort]);

    return (
        <Page title="Kulukorvaukset" actions={<React.Fragment>
            <Switch>
                <input checked={admin} onChange={e => setAdmin(e.target.checked)} type="checkbox" />
                <span>Hallinnoi</span>
            </Switch>
            <Button as={Link} to="/claims/new" color="indigo">Luo uusi</Button>
        </React.Fragment>}>
            <Table>
                <thead>
                    <tr>
                        <Sortable by="createdAt" setter={setSort} sort={sort}>Päivämäärä</Sortable>
                        <Sortable by="description" setter={setSort} sort={sort}>Kuvaus</Sortable>
                        <Sortable by="amount" setter={setSort} sort={sort} className="right">Summa</Sortable>
                        <Sortable by="sourceOfMoney" setter={setSort} sort={sort} className="lg">Rahan lähde</Sortable>
                        {admin && <Sortable by="author" setter={setSort} sort={sort}>Käyttäjä</Sortable>}
                        <Sortable by="status" setter={setSort} sort={sort}>Tila</Sortable>
                    </tr>
                </thead>
                <tbody>
                    {data.map(claim => (
                        <tr key={claim.id}>
                            <td>{claim.createdAt}</td>
                            <td><Link to={'/costclaims/' + claim.id}>{claim.description}</Link></td>
                            <td className="right">{euros.format(claim.amount)}</td>
                            <td className="lg">{claim.sourceOfMoney}</td>
                            {admin && <td>{claim.author}</td>}
                            <td>
                                <Pill color={statusColors[claim.status]}>
                                    {statuses[claim.status]}
                                </Pill>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {!data.length && <div className="empty">
                <div className="empty-icon">
                    <i className="icon icon-3x icon-more-horiz"></i>
                </div>
                <p className="empty-title h5">Ei kulukorvauksia</p>
            </div>}
        </Page>
    );
};

export default CostClaims;
