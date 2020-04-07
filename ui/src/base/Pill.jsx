import React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';

const Pill = styled.span`
    color: ${props => colors[props.color][6]};
    background: ${props => colors[props.color][1]};
    font-weight: 500;

    border-radius: 16px;
    padding: 4px 1rem 6px 1rem;
    font-size: 0.8rem;
`;

export default Pill;