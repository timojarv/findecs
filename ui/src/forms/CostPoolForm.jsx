import React from "react";
import {
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightAddon,
    Flex,
    Button,
} from "@chakra-ui/core";
import { useForm } from "react-hook-form";

const CostPoolForm = (props) => {
    const { onSubmit, onClose, isLoading, data } = props;

    const { register, handleSubmit, errors } = useForm({
        defaultValues: data,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.name} isRequired mb={4}>
                <FormLabel htmlFor="name">Nimi</FormLabel>
                <Input
                    name="name"
                    type="text"
                    ref={register({ required: true })}
                />
            </FormControl>
            <FormControl isInvalid={!!errors.budget} isRequired mb={8}>
                <FormLabel htmlFor="budget">Budjetti</FormLabel>
                <InputGroup>
                    <Input
                        name="budget"
                        borderTopRightRadius="0"
                        borderBottomRightRadius="0"
                        type="number"
                        ref={register({ required: true })}
                    />
                    <InputRightAddon>€</InputRightAddon>
                </InputGroup>
            </FormControl>
            <Flex mb={4} justify="space-between">
                <Button type="button" onClick={onClose}>
                    Peruuta
                </Button>
                <Button
                    type="submit"
                    variantColor="indigo"
                    isLoading={isLoading}
                >
                    {data ? "Tallenna" : "Luo kustannuspaikka"}
                </Button>
            </Flex>
        </form>
    );
};

export default CostPoolForm;
