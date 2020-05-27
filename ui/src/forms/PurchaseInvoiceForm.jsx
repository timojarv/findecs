import React, { useEffect } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    Heading,
    Flex,
    Button,
} from "@chakra-ui/core";
import ContactSearch from "./ContactSearch";
import InvoiceRowInput from "./InvoiceRowInput";
import { useForm } from "react-hook-form";

const PurchaseInvoiceForm = (props) => {
    const { isSubmitting, data, onSubmit, isLoading } = props;
    const { register, control, watch, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (!data) return;
        reset({
            ...data,
            sender: {
                value: data.sender.id,
                label: data.sender.name,
            },
            rows: data.rows.map((row) => ({
                ...row,
                costPool: row.costPool.id,
            })),
        });
    }, [data, reset]);

    return (
        <form
            onSubmit={handleSubmit((form) => {
                if (typeof onSubmit === "function")
                    onSubmit({
                        ...form,
                        sender: form.sender.value,
                        rows: form.rows.map((row) => ({
                            ...row,
                            id: row.id || null,
                        })),
                    });
            })}
        >
            <Flex mb={4} width="100%" align="flex-end">
                <FormControl isDisabled={isLoading} flexGrow={1} isRequired>
                    <FormLabel htmlFor="sender">Lähettäjä</FormLabel>
                    <ContactSearch name="sender" control={control} />
                </FormControl>
            </Flex>
            <Flex width="100%" justify="stretch">
                <FormControl
                    isDisabled={isLoading}
                    width="50%"
                    isRequired
                    mr={4}
                    mb={4}
                >
                    <FormLabel htmlFor="description">Kuvaus</FormLabel>
                    <Input
                        name="description"
                        type="text"
                        ref={register({ required: true })}
                    />
                </FormControl>
                <FormControl
                    isDisabled={isLoading}
                    width="50%"
                    isRequired
                    mb={4}
                >
                    <FormLabel htmlFor="dueDate">Eräpäivä</FormLabel>
                    <Input
                        name="dueDate"
                        type="date"
                        ref={register({ required: true })}
                    />
                </FormControl>
            </Flex>
            <Heading my={4} as="h3" size="lg">
                Rivit
            </Heading>
            <InvoiceRowInput
                register={register}
                control={control}
                watch={watch}
            />
            <FormControl isDisabled={isLoading}>
                <FormLabel>Lisätietoja</FormLabel>
                <Input type="text" name="details" ref={register()} />
            </FormControl>
            <FormControl isDisabled={isLoading} textAlign="right">
                <Button
                    mt={4}
                    isLoading={isSubmitting}
                    type="submit"
                    variantColor="indigo"
                >
                    {data ? "Tallenna" : "Luo ostolasku"}
                </Button>
            </FormControl>
        </form>
    );
};

export default PurchaseInvoiceForm;
