import { format, parseISO } from "date-fns";

export const formatDateTime = (date) =>
    format(parseISO(date + "Z"), "d.M.Y H:mm");
export const formatDate = (date) => format(parseISO(date + "Z"), "d.M.Y");

export const formatCurrency = (amount) =>
    amount.toLocaleString("fi-FI", {
        style: "currency",
        currency: "EUR",
    });

export const referenceNumber = (base) => {
    const coefficients = [7, 3, 1];
    const checksum =
        base
            .toString()
            .split("")
            .reverse()
            .reduce(
                (sum, cur, i) =>
                    sum + parseInt(cur) * coefficients[i % coefficients.length],
                0
            ) % 10;

    return base.toString() + checksum.toString();
};
