import React, { useState, useEffect } from 'react';
import Page from './Page';
import styled from 'styled-components';
import { Paperclip, Printer, Edit, Check, X } from 'react-feather';

const euros = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });

const statuses = {
    created: 'Luotu',
    approved: 'Hyväksytty',
    paid: 'Maksettu',
    rejected: 'Hylätty',
};

const Container = styled.section`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .details {
        flex: 1 0 max-content;
        max-width: 600px;
        margin-bottom: 2rem;
    }

    .card {
        box-shadow: 0 .25rem 0.5rem rgba(48,55,66,.1);
    }
`;

const ReceiptContainer = styled.div`
    width: min-content;
    margin-bottom: 1rem;

    img {
        object-fit: cover;
        width: 300px;
        height: 200px;
    }
`;

const Receipt = props => {
    const { receipt } = props;
    return (
        <ReceiptContainer className="card">
            <div className="card-image">
                <img src={receipt.attachment} alt="" />
            </div>
            <div className="card-header">
                <a className="tooltip btn btn-link float-right" data-tooltip="Avaa kuitti" target="_blank" href={receipt.attachment}>
                    <Paperclip />
                </a>
                <div className="card-title">{euros.format(receipt.amount)}</div>
            </div>
        </ReceiptContainer>
    );
};

const ClaimData = props => {
    const { claim } = props;
    return (
        <Container>
            <div className="tile details">
                <div className="tile-content">
                    <h3 className="text-bold">Tiedot</h3>
                    <div className="tile-title text-bold">Kuvaus</div>
                    <div className="tile-subtitle pb-2">{claim.description}</div>
                    <div className="tile-title text-bold pt-2">Lisätiedot</div>
                    <div className="tile-subtitle pb-2">{claim.details}</div>
                    <div className="tile-title text-bold pt-2">Luotu</div>
                    <div className="tile-subtitle pb-2">{claim.createdAt}</div>
                    <div className="tile-title text-bold pt-2">Summa</div>
                    <div className="tile-subtitle pb-2">{euros.format(claim.amount)}</div>
                    <div className="tile-title text-bold pt-2">Rahan lähde</div>
                    <div className="tile-subtitle pb-2">{claim.sourceOfMoney}</div>
                    <div className="tile-title text-bold pt-2">Status</div>
                    <div className="tile-subtitle pb-2">{statuses[claim.status]}</div>
                    <div className="tile-title text-bold pt-2">Statuksen syy</div>
                    <div className="tile-subtitle pb-2">{claim.statusReason}</div>
                    <div className="tile-title text-bold pt-2">Kustannuspaikka</div>
                    <div className="tile-subtitle pb-2">{claim.costPool}</div>
                    <div className="tile-title text-bold pt-2">Tekijä</div>
                    <div className="tile-subtitle pb-2">{claim.author}</div>
                </div>
            </div>
            <div className="receipts">
                <h3 className="text-bold">Kuitit</h3>
                {claim.receipts.map((receipt, i) => (
                    <Receipt key={i} receipt={receipt} />
                ))}
            </div>
        </Container>
    );
};

const CostClaim = props => {
    const { match: { params: { id } } } = props;
    const [claim, setClaim] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/costClaims/' + id)
            .then(res => res.json())
            .then(setClaim)
    }, [setClaim]);
    return (
        <Page title={'Kulukorvaus #' + id} actions={(
            <React.Fragment>
                <button data-tooltip="Hyväksy" className="btn tooltip btn-link text-success">
                    <Check />
                </button>
                <button data-tooltip="Hylkää" className="btn tooltip btn-link text-error">
                    <X />
                </button>
                <button data-tooltip="Muokkaa" className="btn tooltip btn-link">
                    <Edit />
                </button>
                <button data-tooltip="Tulosta" className="btn tooltip btn-link">
                    <Printer />
                </button>
            </React.Fragment>
        )}>
            {claim ? <ClaimData claim={claim} /> : <div className="loading loading-lg" />}
        </Page>
    );
};

export default CostClaim;

