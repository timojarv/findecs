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

const SalesInvoiceForm = (props) => {
    const { isSubmitting, data, onSubmit } = props;
    const { register, control, watch, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (!data) return;
        reset({
            ...data,
            recipient: {
                value: data.recipient.id,
                label: data.recipient.name,
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
                        recipient: form.recipient.value,
                    });
            })}
        >
            <Flex mb={4} width="100%" align="flex-end">
                <FormControl flexGrow={1} isRequired>
                    <FormLabel htmlFor="recipient">Vastaanottaja</FormLabel>
                    <ContactSearch name="recipient" control={control} />
                </FormControl>
            </Flex>
            <Flex width="100%" justify="stretch">
                <FormControl width="50%" isRequired mr={4} mb={4}>
                    <FormLabel htmlFor="date">Päiväys</FormLabel>
                    <Input
                        name="date"
                        type="date"
                        ref={register({ required: true })}
                    />
                </FormControl>
                <FormControl width="50%" isRequiredmb={4}>
                    <FormLabel htmlFor="dueDate">Eräpäivä</FormLabel>
                    <Input
                        name="dueDate"
                        type="date"
                        ref={register({ required: true })}
                    />
                </FormControl>
            </Flex>
            <Flex width="100%">
                <FormControl width="50%" mr={4} mb={4}>
                    <FormLabel htmlFor="contactPerson">Yhteyshenkilö</FormLabel>
                    <Input name="contactPerson" type="text" ref={register()} />
                </FormControl>
                <FormControl width="50%" mb={4}>
                    <FormLabel htmlFor="payerReference">
                        Maksajan viite
                    </FormLabel>
                    <Input name="payerReference" type="text" ref={register()} />
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
            <FormControl>
                <FormLabel>Lisätietoja</FormLabel>
                <Input type="text" name="details" ref={register()} />
            </FormControl>
            <FormControl textAlign="right">
                <Button
                    mt={4}
                    isLoading={isSubmitting}
                    type="submit"
                    variantColor="indigo"
                >
                    {data ? "Tallenna" : "Luo myyntilasku"}
                </Button>
            </FormControl>
        </form>
    );
};

export default SalesInvoiceForm;
