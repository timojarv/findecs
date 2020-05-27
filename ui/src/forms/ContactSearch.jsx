import React from "react";
import { Box, useTheme, useDisclosure, Button, Flex } from "@chakra-ui/core";
import { useQuery } from "urql";
import ReactSelect from "react-select";
import { Controller } from "react-hook-form";
import NewContact from "../views/Contact/NewContact";

const query = `
    query FetchContacts {
        contacts(limit: null) {
            nodes {
                id
                name
            }
        }
    }
`;

const ContactSearch = (props) => {
    const [result, refetch] = useQuery({ query });
    const theme = useTheme();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { fetching, error, data } = result;

    const options = data
        ? data.contacts.nodes.map((contact) => ({
              value: contact.id,
              label: contact.name,
          }))
        : [];

    return (
        <Flex justify="space-between">
            <Box flexGrow={1}>
                <Controller
                    as={ReactSelect}
                    {...props}
                    options={options}
                    placeholder="Valitse yhteystieto"
                    loadingMessage={() => "Ladataan vaihtoehtoja..."}
                    isLoading={fetching}
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
            <Button ml={4} onClick={onOpen}>
                Uusi yhteystieto
            </Button>
            <NewContact
                isOpen={isOpen}
                onClose={onClose}
                onCreate={() => {
                    onClose();
                    refetch();
                }}
            />
        </Flex>
    );
};

export default ContactSearch;
