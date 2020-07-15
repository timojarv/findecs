import React from "react";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import { Link, Badge } from "@chakra-ui/core";
import { formatDate, formatCurrency } from "../util/format";
import { Link as RouterLink } from "react-router-dom";
import { statusColors, statuses } from "../util/metadata";

const ClaimRow = ({ claim, display }) => {
    return (
        <TR key={claim.id}>
            <TD display={display("description")}>
                <Link
                    as={RouterLink}
                    to={`/costClaims/${claim.id}`}
                    color="indigo.700"
                    display="block"
                >
                    {claim.description}
                </Link>
            </TD>
            <TD display={display("author", ["none", "table-cell"])}>
                <Link
                    whiteSpace="nowrap"
                    as={RouterLink}
                    to={`/users/${claim.author.id}`}
                    color="indigo.700"
                >
                    {claim.author.name}
                </Link>
            </TD>
            <TD display={display("created")} textAlign="right">{formatDate(claim.created)}</TD>
            <TD display={display("total")} textAlign="right">{formatCurrency(claim.total)}</TD>
            <TD display={display("status")} textAlign="right">
                <Badge
                    fontSize="0.8em"
                    mr={-1}
                    variantColor={statusColors[claim.status]}
                >
                    {statuses[claim.status]}
                </Badge>
            </TD>
        </TR>
    );
};

const CostClaimsList = (props) => {
    const { claims = [], disabledColumns = [], sortable = () => ({}) } = props;

    const display = (key, defaultOptions = "table-cell") =>
        disabledColumns.includes(key) ? "none" : defaultOptions;

    return (
        <Table>
            <THead>
                <TR>
                    <TH display={display("description")} {...sortable('description')} textAlign="left">Kuvaus</TH>
                    <TH display={display("author", ["none", "table-cell"])}
                        {...sortable('author')}
                        textAlign="left"
                    >
                        Tekijä
                    </TH>
                    <TH display={display("created")} {...sortable('created')} textAlign="right">Luotu</TH>
                    <TH display={display("total")} {...sortable('total')} textAlign="right">Summa</TH>
                    <TH display={display("status")} {...sortable('status')} textAlign="right">Tila</TH>
                </TR>
            </THead>
            <TBody>
                {claims.filter(v => !!v).map((claim) => (
                    <ClaimRow key={claim.id} claim={claim} display={display} />
                ))}
            </TBody>
        </Table>
    );
};

export default CostClaimsList;
