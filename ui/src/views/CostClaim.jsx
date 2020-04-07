import React, { useState, useEffect } from 'react';
import Page from './Page';
import styled from 'styled-components';
import { Paperclip, Printer, Edit, Check, X } from 'react-feather';
import { Button, Pill } from '../base';
import colors from '../util/colors';
import { statuses } from '../util/statuses';
import { Link } from 'react-router-dom';

const euros = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });

const Container = styled.section`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    h3 {
        color: ${props => colors.gray[8]};
        margin-bottom: 2rem;
    }

    .details {
        flex: 1;
        max-width: 600px;
    }

    dl {
        margin-top: 0;
        margin-bottom: 2rem;
        width: 300px;
        display: inline-block;
        vertical-align: top;

        dt {
            color: ${props => colors.gray[6]};
            font-weight: 400;
            margin-bottom: 0.5rem;
            font-size: 0.9em;
        }

        dd {
            margin-left: 0;
            margin-bottom: 1.5rem;
            font-size: 1.1em
        }
    }
`;

const ReceiptContainer = styled.div`
    width: min-content;
    margin-bottom: 1rem;
    box-shadow 1px 1px 4px 0 rgba(0,0,0,0.3);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid ${props => colors.gray[3]};

    img {
        object-fit: cover;
        width: 300px;
        height: 200px;
        border-bottom: 1px solid ${props => colors.gray[1]};
    }

    div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
    }

    strong {
        color: ${props => colors.gray[7]};
    }

    a {
        color: ${props => colors.indigo[5]};
    }
`;

const Receipt = props => {
    const { receipt } = props;
    return (
        <ReceiptContainer>
            <img src={receipt.attachment} alt="" />
            <div>
                <strong>{euros.format(receipt.amount)}</strong>
                <Button className="icon" color="indigo" target="_blank" href={receipt.attachment}>
                    <Paperclip />
                </Button>
            </div>
        </ReceiptContainer>
    );
};

const ClaimData = props => {
    const { claim } = props;
    return (
        <Container>
            <div className="details">
                <h3 className="text-bold">Tiedot</h3>
                <dl>
                    <dt>Kuvaus</dt>
                    <dd>{claim.description}</dd>
                    <dt>Luotu</dt>
                    <dd>{claim.createdAt}</dd>
                    <dt>Summa</dt>
                    <dd>{euros.format(claim.amount)}</dd>
                    <dt>Kustannuspaikka</dt>
                    <dd>{claim.costPool}</dd>
                    <dt>Tekijä</dt>
                    <dd>{claim.author}</dd>
                </dl>
                <dl>
                    <dt>Lisätiedot</dt>
                    <dd>{claim.details}</dd>
                    <dt>Rahan lähde</dt>
                    <dd>{claim.sourceOfMoney}</dd>
                    <dt>Status</dt>
                    <dd>
                        {statuses[claim.status]}
                    </dd>
                    <dt>Statuksen syy</dt>
                    <dd>{claim.statusReason}</dd>
                </dl>
            </div>
            <div className="receipts">
                <h3>Kuitit</h3>
                {claim.receipts.map((receipt, i) => (
                    <Receipt key={i} receipt={receipt} />
                ))}
            </div>
        </Container>
    );
};

const CostClaim = props => {
    const { match: { params: { id } }, location } = props;
    const [claim, setClaim] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/costClaims/' + id)
            .then(res => res.json())
            .then(setClaim)
    }, [setClaim]);
    return (
        <Page link="/costclaims" title={'Kulukorvaus #' + id} actions={(
            <React.Fragment>
                <Button color="green" style={{ marginRight: '2rem' }} className="icon">
                    <Check />
                </Button>
                <Button color="red" style={{ marginRight: '2rem' }} className="icon">
                    <X />
                </Button>
                <Button as={Link} to={location.pathname + '/print'} color="indigo" style={{ marginRight: '2.5rem' }} className="icon">
                    <Printer />
                </Button>
                <Button as={Link} to={location.pathname + '/edit'} color="indigo">
                    Muokkaa
                </Button>
            </React.Fragment>
        )}>
            {claim ? <ClaimData claim={claim} /> : <div className="loading loading-lg" />}
        </Page>
    );
};

export default CostClaim;

