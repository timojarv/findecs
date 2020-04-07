import React from 'react';
import styled from 'styled-components';
import colors from '../util/colors';

const TableHead = styled.th`
    cursor: pointer;
    transition: color 0.1s;

    &:hover {
        color: ${props => colors.gray[5]};
    }
`;

const Sorter = styled.div.attrs({ className: 'sorter' })`
    display: inline-block;
    font-size: 0.5em;
    margin-left: 0.5rem;

    span {
        display: block;

        &.asc {
            color: ${props => props.active && props.order === 'asc' ? colors.indigo[6] : 'inherit'};
        }

        &.desc {
            color: ${props => props.active && props.order === 'desc' ? colors.indigo[6] : 'inherit'};
        }
    }
`;

export const Sortable = props => {
    const { by, sort, setter, children, ...other } = props;
    const onSet = () => {
        if (sort.key == by) {
            setter({ ...sort, order: sort.order === 'desc' ? 'asc' : 'desc' });
        } else {
            setter({ key: by, order: 'asc' });
        }
    };
    return (
        <TableHead onClick={onSet} {...other} >
            {children}
            <Sorter order={sort.order} active={sort.key === by}>
                <span className="asc">▲</span>
                <span className="desc">▼</span>
            </Sorter>
        </TableHead>
    );
}

const Table = styled.table`
    color: ${props => colors.gray[8]};
    border-collapse: collapse;
    min-width: 100%;
    margin-top: 2rem;
    
    a {
        text-decoration: none;
        color: ${props => colors.gray[7]};
        transition: color 0.1s;
        border-bottom: 1px dashed ${props => colors.gray[4]};

        &:hover {
            color: ${props => colors.gray[9]};
        }
    }

    td {
        padding: 2rem 1rem;
        text-align: left;
        border-bottom: 1px solid ${props => colors.gray[1]};

        &.right {
            text-align: right;
        }
    }

    th {
        padding: 1.2rem 1rem;
        text-align: left;
        background: ${props => colors.gray[1]};
        color: ${props => colors.gray[6]};
        font-size: 0.85em;
        font-weight:500;
        height: 1rem;

        &.right {
            text-align: right;
        }
    }

    @media only screen and (max-width: 840px) {
        td, th {
            font-size: 0.8em;
        }

        margin-left: -1rem;
        margin-right: -1rem;
        margin-top: 1rem;

        .lg {
            display: none;
        }

        td, th {
            padding: 1.5rem 0.5rem;
        }


    }
`;

export default Table;