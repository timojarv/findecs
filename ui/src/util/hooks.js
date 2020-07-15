import { useState } from "react";
import { sortable } from "../components/Table";
import { useQuery }  from "urql";

export const useSortable = (defaultOptions) => {
    const [options, setOptions] = useState(defaultOptions);

    return [
        options,
        key => sortable(options, key, setOptions),
    ];
};


const query = `
    query Role {
        user {
			id
            role
        }
    }
`;

const roles = ['basic', 'admin', 'root'];

export const useAccess = () => {
    const [result] = useQuery({ query });

    const allowed = role => !result.data
        ? false
        : roles.indexOf(result.data.user.role) >= roles.indexOf(role);

    return (role, alternative) => (allowed(role) || alternative) ? undefined : 'none';
};