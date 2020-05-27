import React from "react";
import { Heading, Box } from "@chakra-ui/core";
import UserForm from "../../forms/UserForm";
import { useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const mutation = `
    mutation CreateUser($user: UserInput!) {
        createUser(user: $user) {
            id
            name
            email
            role
            hasPassword
            signature
        }
    }
`;

const NewUser = (props) => {
    const [creation, createUser] = useMutation(mutation);
    const { successMessage, errorMessage } = useMessage();
    const handleSubmit = (data) => {
        createUser({ user: data }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                successMessage("Käyttäjä luotu");
                props.history.push(`/users`);
            }
        });
    };

    return (
        <Box maxWidth="400px" margin="auto" mt={8}>
            <Heading mb={8}>Uusi käyttäjä</Heading>
            <ErrorDisplay error={creation.error} />
            <UserForm
                onSubmit={handleSubmit}
                isSubmitting={creation.fetching}
            />
        </Box>
    );
};

export default NewUser;
