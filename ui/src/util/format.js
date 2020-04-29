import { format, parseISO } from "date-fns";

export const formatDateTime = (date) =>
    format(new Date(date + " UTC"), "d.M.Y H:mm");
export const formatDate = (date) => format(new Date(date + " UTC"), "d.M.Y");

export const formatCurrency = (amount) =>
    amount.toLocaleString("fi-FI", {
        style: "currency",
        currency: "EUR",
    });
