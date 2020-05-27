import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    FormControl,
    FormLabel,
    Input,
    Select,
    InputGroup,
    InputRightElement,
    IconButton,
    useDisclosure,
    FormHelperText,
    Button,
    Flex,
    FormErrorMessage,
    Spinner,
} from "@chakra-ui/core";
import { roles } from "../util/metadata";
import { useForm } from "react-hook-form";

const UserForm = (props) => {
    const { onSubmit, data, isLoading, isSubmitting } = props;

    const { isOpen, onToggle } = useDisclosure();
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (data) reset(data);
    }, [data, reset]);

    if (isLoading) return <Spinner color="indigo.500" size="lg" />;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isRequired mb={4}>
                <FormLabel htmlFor="name">Nimi</FormLabel>
                <Input ref={register()} type="text" name="name" />
                <FormErrorMessage>Nimi on jo käytössä</FormErrorMessage>
            </FormControl>
            <FormControl isRequired mb={4}>
                <FormLabel htmlFor="email">Sähköposti</FormLabel>
                <Input ref={register()} type="email" name="email" />
                <FormErrorMessage>Sähköposti ei kelpaa</FormErrorMessage>
            </FormControl>
            <FormControl isRequired mb={4}>
                <FormLabel htmlFor="role">Rooli</FormLabel>
                <Select ref={register()} name="role">
                    {Object.keys(roles).map((role, i) => (
                        <option key={role} value={role}>
                            {roles[role].label}
                        </option>
                    ))}
                </Select>
            </FormControl>
            <FormControl display={data ? "none" : "block"} mb={4}>
                <FormLabel htmlFor="password">Salasana</FormLabel>
                <InputGroup>
                    <Input
                        ref={register()}
                        type={isOpen ? "text" : "password"}
                        name="password"
                    />
                    <InputRightElement>
                        <IconButton
                            icon="view"
                            variant="ghost"
                            variantColor={isOpen ? "indigo" : "gray"}
                            onClick={onToggle}
                        />
                    </InputRightElement>
                </InputGroup>
                <FormHelperText>
                    Mikäli salasanaa ei aseteta, käyttäjälle lähetetään
                    sähköposti salasanan vaihtamista varten.
                </FormHelperText>
            </FormControl>

            <Flex pt={4} justify="space-between">
                <Button
                    to="/users"
                    as={RouterLink}
                    leftIcon="arrow-back"
                    mr={2}
                    type="button"
                >
                    Peruuta
                </Button>
                <Button
                    type="submit"
                    variantColor="indigo"
                    isLoading={isSubmitting}
                >
                    {data ? "Tallenna" : "Luo Käyttäjä"}
                </Button>
            </Flex>
        </form>
    );
};

export default UserForm;
