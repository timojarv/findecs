import React, { useState, useContext } from "react";
import {
    Flex,
    Heading,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    FormHelperText,
    Button,
    Link,
    Image,
    useToast,
} from "@chakra-ui/core";
import { useClient } from "urql";
import { useForm } from "react-hook-form";
import FindecsLogo from "../resources/logo.svg";
import { AuthContext } from "../util/auth";

const query = `
    query Login($email: String!, $password: String!) {
        accessToken(email: $email, password: $password)
    }
`;

const Login = (props) => {
    const client = useClient();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm();
    const toast = useToast();
    const { setToken } = useContext(AuthContext);

    const onSubmit = (form) => {
        setLoading(true);
        client
            .query(query, form, { requestPolicy: "network-only" })
            .toPromise()
            .then((res) => {
                if (res.error) {
                    toast({
                        title: "Kirjautuminen epäonnistui",
                        status: "error",
                        position: "top",
                    });
                    setLoading(false);
                } else {
                    toast({
                        title: "Kirjautuminen onnistui",
                        status: "success",
                        position: "top",
                    });
                    setToken(res.data.accessToken);
                    props.history.push("/");
                }
            });
    };

    return (
        <Flex align="center" width="100%" direction="column">
            <Image size={[16, 24]} my={[4, 10]} as={FindecsLogo} />
            <Box
                width="sm"
                as="form"
                onSubmit={handleSubmit(onSubmit)}
                border="1px"
                borderColor="gray.300"
                shadow="md"
                rounded="lg"
                p={[4, 8]}
                maxWidth="100%"
            >
                <Heading mb={8} as="h1" size="lg">
                    Kirjaudu sisään
                </Heading>
                <FormControl mb={4}>
                    <FormLabel>Sähköposti</FormLabel>
                    <Input
                        name="email"
                        type="email"
                        ref={register({ required: true })}
                    />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Salasana</FormLabel>
                    <Input
                        name="password"
                        type="password"
                        ref={register({ required: true })}
                    />
                    <FormHelperText>
                        <Link>Salasana unohtunut?</Link>
                    </FormHelperText>
                </FormControl>
                <Flex align="center">
                    <Checkbox flexGrow={1} name="remember" ref={register}>
                        Muista salasana
                    </Checkbox>
                    <Button
                        isLoading={loading}
                        type="submit"
                        float="right"
                        variantColor="indigo"
                    >
                        Kirjaudu
                    </Button>
                </Flex>
            </Box>
            <Box my={10} height={20}></Box>
        </Flex>
    );
};

export default Login;
