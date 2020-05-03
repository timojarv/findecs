import { format, parseISO } from "date-fns";

export const formatDateTime = (date) =>
    format(parseISO(date + "Z"), "d.M.Y H:mm");
export const formatDate = (date) => format(parseISO(date + "Z"), "d.M.Y");

export const formatCurrency = (amount) =>
    amount.toLocaleString("fi-FI", {
        style: "currency",
        currency: "EUR",
    });
