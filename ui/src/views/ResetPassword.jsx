import React, { useState } from "react";
import {
    Flex,
    Heading,
    Box,
    FormControl,
    FormLabel,
    Input,
    Button,
    Image,
} from "@chakra-ui/core";
import { useForm } from "react-hook-form";
import FindecsLogo from "../resources/logo.svg";
import { Link as RouterLink } from "react-router-dom";

const ResetPassword = (props) => {
    const { register, handleSubmit } = useForm();

    const resetToken = new URLSearchParams(props.location.search).get("token");

    if (resetToken) {
        return (
            <Flex align="center" width="100%" direction="column">
                <Image size={[16, 24]} my={[4, 10]} as={FindecsLogo} />
                <Box
                    width="sm"
                    as="form"
                    border="1px"
                    borderColor="gray.300"
                    shadow="md"
                    rounded="lg"
                    p={[4, 8]}
                    maxWidth="100%"
                >
                    <Heading mb={8} as="h1" size="lg">
                        Palauta salasana
                    </Heading>
                    <FormControl mb={4}>
                        <FormLabel>Uusi salasana</FormLabel>
                        <Input
                            name="newPassword"
                            type="password"
                            ref={register({ required: true })}
                        />
                    </FormControl>
                    <FormControl mb={6}>
                        <FormLabel>Vahvista salasana</FormLabel>
                        <Input
                            name="confirmPassword"
                            type="password"
                            ref={register({ required: true })}
                        />
                    </FormControl>
                    <Flex justify="space-between">
                        <Button as={RouterLink} to="/login">
                            Peruuta
                        </Button>
                        <Button type="submit" variantColor="indigo">
                            Aseta salasana
                        </Button>
                    </Flex>
                </Box>
                <Box my={10} height={20}></Box>
            </Flex>
        );
    }

    return (
        <Flex align="center" width="100%" direction="column">
            <Image size={[16, 24]} my={[4, 10]} as={FindecsLogo} />
            <Box
                width="sm"
                as="form"
                border="1px"
                borderColor="gray.300"
                shadow="md"
                rounded="lg"
                p={[4, 8]}
                maxWidth="100%"
            >
                <Heading mb={8} as="h1" size="lg">
                    Palauta salasana
                </Heading>
                <FormControl mb={6}>
                    <FormLabel>Sähköposti</FormLabel>
                    <Input
                        name="email"
                        type="email"
                        ref={register({ required: true })}
                    />
                </FormControl>
                <Flex justify="space-between">
                    <Button as={RouterLink} to="/login">
                        Peruuta
                    </Button>
                    <Button type="submit" variantColor="indigo">
                        Lähetä linkki
                    </Button>
                </Flex>
            </Box>
            <Box my={10} height={20}></Box>
        </Flex>
    );
};

export default ResetPassword;
