import React, { useEffect } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    IconButton,
    Box,
    Select,
    InputGroup,
    InputRightAddon,
    Button,
    Flex,
} from "@chakra-ui/core";
import { useFieldArray } from "react-hook-form";
import { useQuery } from "urql";
import { formatCurrency } from "../util/format";

const query = `
    query FetchCostPools {
        costPools(limit: null) {
            nodes {
                id
                name
            }
        }
    }
`;

const InvoiceRowInput = (props) => {
    const { register, control, watch } = props;

    const [result] = useQuery({ query });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows",
        keyName: "key",
    });

    useEffect(() => append(), [append]);

    const costPools = result.data ? result.data.costPools.nodes : [];

    const rows = watch("rows", []);

    return (
        <table width="100%">
            <thead>
                <tr>
                    <Box as="th" textAlign="left">
                        <FormLabel isRequired>Kuvaus</FormLabel>
                    </Box>
                    <Box as="th" textAlign="left">
                        <FormLabel isRequired>Summa</FormLabel>
                    </Box>
                    <Box as="th" textAlign="left">
                        <FormLabel isRequired>Kustannuspaikka</FormLabel>
                    </Box>
                </tr>
            </thead>
            <tbody>
                {fields.map((field, index) => (
                    <tr key={field.key}>
                        <FormControl as="td" pb={4} isRequired pr={4}>
                            <Input
                                name={`rows[${index}].description`}
                                ref={register({ required: true })}
                                defaultValue={field.description}
                            />
                        </FormControl>
                        <FormControl as="td" pb={4} isRequired>
                            <InputGroup mr={4}>
                                <Input
                                    type="number"
                                    step="0.01"
                                    name={`rows[${index}].amount`}
                                    ref={register({ required: true })}
                                    borderBottomRightRadius={0}
                                    borderTopRightRadius={0}
                                    defaultValue={field.amount}
                                />
                                <InputRightAddon>€</InputRightAddon>
                            </InputGroup>
                        </FormControl>
                        <FormControl as="td" pb={4} isRequired>
                            <Flex>
                                <Select
                                    name={`rows[${index}].costPool`}
                                    placeholder="Valitse kustannuspaikka"
                                    ref={register({ required: true })}
                                    mr={4}
                                    defaultValue={field.costPool}
                                >
                                    {costPools.map(({ name, id }) => (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    ))}
                                </Select>
                                <IconButton
                                    icon="delete"
                                    variantColor="red"
                                    onClick={() => remove(index)}
                                />
                            </Flex>
                        </FormControl>
                        <FormControl as="td" display="none">
                            <Input
                                ref={register()}
                                defaultValue={field.id}
                                name={`rows[${index}].id`}
                            />
                        </FormControl>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <Box as="th" textAlign="left">
                        Yhteensä:
                    </Box>
                    <Box as="th" textAlign="left">
                        {formatCurrency(
                            rows.reduce(
                                (sum, field) =>
                                    sum + (parseFloat(field.amount) || 0),
                                0
                            )
                        )}
                    </Box>
                    <Box as="th" textAlign="right" py={4}>
                        <Button onClick={() => append()}>Lisää rivi</Button>
                    </Box>
                </tr>
            </tfoot>
        </table>
    );
};

export default InvoiceRowInput;
