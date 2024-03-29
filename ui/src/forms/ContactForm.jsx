import React from "react";
import {
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Flex,
    Button,
} from "@chakra-ui/core";
import { useForm } from "react-hook-form";

const ContactForm = (props) => {
    const { onSubmit, onClose, data, isSubmitting } = props;
    const { register, handleSubmit } = useForm({ defaultValues: data });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl mb={4} isRequired>
                <FormLabel htmlFor="name">Nimi</FormLabel>
                <Input
                    spellCheck={false}
                    name="name"
                    ref={register({ required: true })}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel htmlFor="address">Osoitetiedot</FormLabel>
                <Textarea height={40} name="address" ref={register} />
            </FormControl>
            <Flex mb={4} justify="space-between">
                <Button onClick={onClose} type="button">
                    Peruuta
                </Button>
                <Button
                    isLoading={isSubmitting}
                    variantColor="indigo"
                    type="submit"
                >
                    {data ? "Tallenna" : "Luo yhteystieto"}
                </Button>
            </Flex>
        </form>
    );
};

export default ContactForm;
