import React from "react";
import { Box, useTheme } from "@chakra-ui/core";
import { useQuery } from "urql";
import Select from "react-select";

const query = `
    query FetchContacts {
        contacts(limit: 500) {
            id
            name
            address
        }
    }
`;

const ContactSearch = (props) => {
    const [result] = useQuery({ query });
    const theme = useTheme();

    const options = result.data
        ? result.data.contacts.map((contact) => ({
              value: contact.id,
              label: contact.name,
          }))
        : [];

    return (
        <Box>
            <Select
                options={options}
                placeholder="Valitse yhteystieto"
                loadingMessage={() => "Ladataan vaihtoehtoja..."}
                isLoading={result.fetching}
                noOptionsMessage={() => "Ei tuloksia"}
                theme={(defaultTheme) => ({
                    ...defaultTheme,
                    spacing: {
                        ...defaultTheme.spacing,
                        controlHeight: "2.5rem",
                    },
                    borderRadius: theme.space[1],
                    colors: {
                        ...defaultTheme.colors,
                        primary: theme.colors.blue[500],
                        primary75: theme.colors.blue[200],
                        primary50: theme.colors.blue[100],
                        primary25: theme.colors.blue[50],
                        danger: theme.colors.red[500],
                        dangerLight: theme.colors.red[200],
                        neutral20: theme.colors.gray[200],
                        neutral30: theme.colors.gray[300],
                    },
                })}
                styles={{
                    valueContainer: (provided) => ({
                        ...provided,
                        paddingLeft: "1rem",
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        marginLeft: "0px",
                    }),
                    placeholder: (provided) => ({
                        ...provided,
                        marginLeft: "0px",
                    }),
                }}
            />
        </Box>
    );
};

export default ContactSearch;
