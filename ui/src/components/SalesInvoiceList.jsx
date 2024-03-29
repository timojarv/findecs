import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@chakra-ui/core";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import { formatDate, formatCurrency } from "../util/format";

const SalesInvoiceList = (props) => {
    const { invoices, sortable = () => ({}), disabledColumns = [] } = props;

    const display = (key) =>
        disabledColumns.includes(key) ? "none" : "table-cell";

    return (
        <Table>
            <THead>
                <TR>
                    <TH {...sortable('runningNumber')} textAlign="left">Numero</TH>
                    <TH {...sortable('recipient')} display={display("recipient")} textAlign="left">
                        Maksaja
                    </TH>
                    <TH {...sortable('date')} textAlign="right">Päiväys</TH>
                    <TH {...sortable('total')} textAlign="right">Summa</TH>
                    <TH {...sortable('dueDate')} textAlign="right">Eräpäivä</TH>
                </TR>
            </THead>
            <TBody>
                {invoices.map((invoice) => (
                    <TR key={invoice.id}>
                        <TD>
                            <Link
                                as={RouterLink}
                                to={`/salesInvoices/${invoice.id}`}
                                color="indigo.700"
                            >
                                {invoice.runningNumber}
                            </Link>
                        </TD>
                        <TD display={display("recipient")}>
                            <Link
                                as={RouterLink}
                                to={`/contacts/${invoice.recipient.id}`}
                                color="indigo.700"
                            >
                                {invoice.recipient.name}
                            </Link>
                        </TD>
                        <TD textAlign="right">{formatDate(invoice.date)}</TD>
                        <TD textAlign="right">
                            {formatCurrency(invoice.total)}
                        </TD>
                        <TD textAlign="right">{formatDate(invoice.dueDate)}</TD>
                    </TR>
                ))}
            </TBody>
        </Table>
    );
};

export default SalesInvoiceList;
