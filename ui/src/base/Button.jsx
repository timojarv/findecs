import React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';

const Button = styled.button`
    color: ${props => colors.gray[0]};
    background: ${props => colors[props.color][5]};
    display: inline-block;
    text-decoration: none;
    padding: 0.75rem 2rem;
    box-sizing: border-box;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow 1px 1px 4px 0 rgba(0,0,0,0.3);
    white-space: nowrap;
    border:none;
    
    &:hover {
        background: ${props => colors[props.color][7]};
    }

    &.icon {
        background: transparent;
        padding: 0.25rem;
        color: ${props => colors[props.color][5]};
        box-shadow: none;
        border: none;

        &:hover {
            background: transparent;
            color: ${props => colors[props.color][8]};
        }
    }
`;

export default Button;