import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@chakra-ui/core";
import { Table, THead, TBody, TR, TH, TD } from "./Table";
import { formatDate, formatCurrency } from "../util/format";

const PurchaseInvoiceList = (props) => {
    const { invoices, sortable = () => ({}), disabledColumns = [] } = props;

    const display = (key) =>
        disabledColumns.includes(key) ? "none" : "table-cell";

    return (
        <Table>
            <THead>
                <TR>
                    <TH {...sortable('description')} textAlign="left">Kuvaus</TH>
                    <TH {...sortable('sender')} display={display("sender")} textAlign="left">
                        Lähettäjä
                    </TH>
                    <TH {...sortable('created')} textAlign="right">Luotu</TH>
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
                                to={`/purchaseInvoices/${invoice.id}`}
                                color="indigo.700"
                            >
                                {invoice.description}
                            </Link>
                        </TD>
                        <TD display={display("sender")}>
                            <Link
                                as={RouterLink}
                                to={`/contacts/${invoice.sender.id}`}
                                color="indigo.700"
                            >
                                {invoice.sender.name}
                            </Link>
                        </TD>
                        <TD textAlign="right">{formatDate(invoice.created)}</TD>
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

export default PurchaseInvoiceList;
