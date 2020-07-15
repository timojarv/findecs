import React from 'react';
import { Box } from "@chakra-ui/core";
import { TableContainer, Table, THead, TR, TH, TBody, TD, sortable } from "./Table";

export default {
    title: 'Table'
};

const defaultOptions = { key: "name", order: "asc" };

export const Sortable = () => <Box p={8}>
    <TableContainer>
        <Table>
            <THead>
                <TR>
                    <TH {...sortable(defaultOptions, "name", console.log)} textAlign="left">Nimi</TH>
                    <TH {...sortable(defaultOptions, "created", console.log)} extAlign="left">Luotu</TH>
                    <TH {...sortable(defaultOptions, "description", console.log)} textAlign="left">Kuvaus</TH>
                </TR>
            </THead>
            <TBody>
                <TR>
                    <TD>Asia 1</TD>
                    <TD>12.5.2020</TD>
                    <TD>Jokin juttu vaan</TD>
                </TR>
                <TR>
                    <TD>Asia 2</TD>
                    <TD>13.5.2020</TD>
                    <TD>Ammoinenkin juttu vaan</TD>
                </TR>
                <TR>
                    <TD>Asia 3</TD>
                    <TD>10.5.2020</TD>
                    <TD>Örkin juttu vaan</TD>
                </TR>
            </TBody>
        </Table>
    </TableContainer>
</Box>