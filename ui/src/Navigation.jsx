import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import IndecsLogoSVG from './indecs.svg';
import { CreditCard, FileText, DollarSign, CheckSquare, Users, Layers, Settings, LogOut, X, Menu } from 'react-feather';
import styled from 'styled-components';

const Nav = styled.nav`
    left: 0;
    color: white;
    width: 100vw;
    padding: 0.75rem 0;
    overflow: hidden;
    height: ${props => props.open ? 'auto' : '3rem'}

    @media only screen and (min-width: 840px) {
        position: fixed;
        height: 100vh;
        width: 12rem;
        padding: 1rem 0;
    }

    a {

        margin: 1rem 0 1rem -0.25rem;
        padding: 0.75rem 0.75rem 0.75rem 1rem;
        display: flex;
        align-items: center;
        border-left: 8px solid transparent;
        color: white;
        text-decoration: none;
        transition: transform 0.2s;

        &:hover, &.active {
            background: rgba(255, 255, 255, 0.1);
        }

        &:hover {
            transform: translate3d(4px, 0, 0);
        }

        &.active {
            border-left-color: white;
        }

        svg {
            flex: none;
        }

        span {
            font-weigth: semibold;
            margin-left: 1.5rem;
        }
    }
`;

const Toggler = styled.button`
    top: 0;
    right: 0;
    position: absolute;
    padding: 0.75rem;
    background-color: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 3rem;
    
    &:focus {
        outline: none;
    }

    @media only screen and (min-width: 840px) {
        display: none;
    }
`;

const Title = styled.h1`
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1.25;
    margin-left: 1.25rem;
    margin-bottom: 1.5rem;
`;

const IndecsLogo = styled(IndecsLogoSVG)`
    font-size: 1.25rem;
    opacity: 0.3;
    margin: auto;
    width: 100%;
    position: absolute;
    bottom: 0;
    display: none;

    @media only screen and (min-width: 840px) {
        display: block;
    }

`;

const Navigation = props => {
    const [open, setOpen] = useState(false);
    return (
        <Nav open={open} className="bg-primary">
            <Toggler onClick={() => setOpen(!open)}>
                {open
                    ? <X />
                    : <Menu />
                }
            </Toggler>
            <Title>Findecs</Title>
            <NavLink
                to="/claims"
            >
                <CreditCard />
                <span>Kulukorvaukset</span>
            </NavLink>
            <NavLink
                to="/purchaseinvoices"
            >
                <FileText />
                <span>Ostolaskut</span>
            </NavLink>
            <NavLink
                to="/salesinvoices"
            >
                <DollarSign />
                <span>Myynti</span>
            </NavLink>
            <NavLink
                to="/approvals"
            >
                <CheckSquare />
                <span>Hyväksyttävät</span>
            </NavLink>
            <NavLink
                to="/users"
            >
                <Users />
                <span>Käyttäjät</span>
            </NavLink>
            <NavLink
                to="/costpools"
            >
                <Layers />
                <span>Kustannuspaikat</span>
            </NavLink>
            <NavLink
                to="/settings"
            >
                <Settings />
                <span>Asetukset</span>
            </NavLink>
            <NavLink
                to="/logout"
            >
                <LogOut />
                <span>Kirjaudu ulos</span>
            </NavLink>
            <IndecsLogo />
        </Nav>
    );
};

export default Navigation;
