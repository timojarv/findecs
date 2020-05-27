import React from "react";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import { Link, Badge } from "@chakra-ui/core";
import { formatDate, formatCurrency } from "../util/format";
import { Link as RouterLink } from "react-router-dom";
import { statusColors, statuses } from "../util/metadata";

const CostClaimsList = (props) => {
    const { claims = [], disabledColumns = [] } = props;

    const display = (key) =>
        disabledColumns.includes(key) ? "none" : "table-cell";

    return (
        <Table>
            <THead>
                <TR>
                    <TH textAlign="left">Kuvaus</TH>
                    <TH display={display("author")} textAlign="left">
                        Tekijä
                    </TH>
                    <TH display={["none", "table-cell"]} textAlign="left">
                        Luotu
                    </TH>
                    <TH textAlign="right">Summa</TH>
                    <TH display={["none", "table-cell"]} textAlign="right">
                        Tila
                    </TH>
                </TR>
            </THead>
            <TBody>
                {claims.map((claim) => (
                    <TR key={claim.id}>
                        <TD>
                            <Link
                                as={RouterLink}
                                color="indigo.700"
                                to={`/costClaims/${claim.id}`}
                            >
                                {claim.description}
                            </Link>
                        </TD>
                        <TD display={display("author")}>
                            <Link
                                as={RouterLink}
                                color="indigo.700"
                                to="/users"
                            >
                                {claim.author.name}
                            </Link>
                        </TD>
                        <TD display={["none", "table-cell"]}>
                            {formatDate(claim.created)}
                        </TD>
                        <TD textAlign="right">{formatCurrency(claim.total)}</TD>
                        <TD display={["none", "table-cell"]} textAlign="right">
                            <Badge
                                fontSize="0.8em"
                                mr={-1}
                                variantColor={statusColors[claim.status]}
                            >
                                {statuses[claim.status]}
                            </Badge>
                        </TD>
                    </TR>
                ))}
            </TBody>
        </Table>
    );
};

export default CostClaimsList;
