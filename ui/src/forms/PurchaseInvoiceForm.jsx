import React from "react";
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
    const { isSubmitting, data, onSubmit } = props;
    const { register, control, watch, handleSubmit } = useForm();
    return (
        <form
            onSubmit={handleSubmit((form) => {
                if (typeof onSubmit === "function") onSubmit(form);
            })}
        >
            <Flex mb={4} width="100%" align="flex-end">
                <FormControl flexGrow={1} isRequired mr={4}>
                    <FormLabel htmlFor="sender">Lähettäjä</FormLabel>
                    <ContactSearch name="sender" control={control} />
                </FormControl>
                <Button>Uusi yhteystieto</Button>
            </Flex>
            <Flex width="100%" justify="stretch">
                <FormControl width="50%" isRequired mr={4} mb={4}>
                    <FormLabel htmlFor="description">Kuvaus</FormLabel>
                    <Input
                        name="description"
                        type="text"
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
                    {data ? "Tallenna" : "Luo ostolasku"}
                </Button>
            </FormControl>
        </form>
    );
};

export default PurchaseInvoiceForm;
