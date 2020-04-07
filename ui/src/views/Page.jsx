import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';
import styled from 'styled-components';
import colors from '../util/colors';

const Header = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 0.5rem;
    color: ${props => colors.gray[8]};
    flex-wrap: wrap;

    h2 {
        font-size: 2em;
        margin: 0;
        white-space: nowrap;
        flex: 1;
    }

    & > * {
        margin-top: 1rem;
    }
`;

const BackLink = styled(Link)`
    text-decoration: none;
    color: ${props => colors.indigo[5]};
    display: flex;
    align-items: middle;
    line-height 24px;
    margin-bottom: 0.5rem;

    svg {
        margin-right: 0.5rem;
    }

    &:hover {
        color: ${props => colors.indigo[8]};
    }
`;

const Page = props => {
    const { title, children, actions, link } = props;
    return (
        <React.Fragment>
            {link && <BackLink to={link}>
                <ArrowLeft />
                Takaisin
            </BackLink>}
            <Header>
                <h2>{title}</h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {actions}
                </div>
            </Header>
            {children}
        </React.Fragment>
    );
};

export default Page;