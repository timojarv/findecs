import React from "react";
import { Heading, Box, useToast } from "@chakra-ui/core";
import UserForm from "../../forms/UserForm";
import { useMutation, useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const query = `
    query FetchUser($id: ID!) {
        user(id: $id) {
            id
            name
            email
            role
        }
    }
`;

const mutation = `
    mutation UpdateUser($id: ID!, $user: UserInput!) {
        updateUser(id: $id, user: $user) {
            id
            name
            email
            role
            hasPassword
            signature
        }
    }
`;

const EditUser = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });
    const [update, updateUser] = useMutation(mutation);
    const { infoMessage, errorMessage } = useMessage();

    const { error, data, fetching } = result;

    const handleSubmit = (data) => {
        updateUser({ user: data, id }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                infoMessage("Käyttäjä päivitetty");
                props.history.push(`/users`);
            }
        });
    };

    return (
        <Box maxWidth="400px" margin="auto" mt={8}>
            <Heading mb={8}>Muokkaa käyttäjää</Heading>
            <ErrorDisplay error={update.error || error} />
            <UserForm
                data={data && data.user}
                onSubmit={handleSubmit}
                isLoading={fetching}
                isSubmitting={update.fetching}
            />
        </Box>
    );
};

export default EditUser;
