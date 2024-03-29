import React from "react";
import {
    Flex,
    Heading,
    Box,
    FormControl,
    FormLabel,
    Input,
    FormHelperText,
    Button,
    Link,
    Image,
} from "@chakra-ui/core";
import { useMutation } from "urql";
import { useForm } from "react-hook-form";
import FindecsLogo from "../resources/logo.svg";
import { useMessage } from "../util/message";
import { Link as RouterLink } from "react-router-dom";

const mutation = `
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            id
            name
        }
    }
`;

const Login = (props) => {
    const { setUser } = props;
    const [login, doLogin] = useMutation(mutation);
    const { register, handleSubmit } = useForm();
    const { successMessage, errorMessage } = useMessage();

    const onSubmit = (form) => {
        doLogin(form).then((res) => {
            if (res.error) {
                errorMessage("Kirjautuminen epäonnistui", true);
            } else {
                successMessage("Kirjautuminen onnistui");
                setUser(res.data.login);
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
                        <Link as={RouterLink} to="/resetPassword">
                            Salasana unohtunut?
                        </Link>
                    </FormHelperText>
                </FormControl>
                <Button
                    isLoading={login.fetching}
                    type="submit"
                    float="right"
                    variantColor="indigo"
                >
                    Kirjaudu
                </Button>
            </Box>
            <Box my={10} height={20}></Box>
        </Flex>
    );
};

export default Login;
