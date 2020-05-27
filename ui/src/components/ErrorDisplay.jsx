import React from "react";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    Collapse,
    useDisclosure,
    Button,
    Code,
} from "@chakra-ui/core";

const messages = {
    "[GraphQL] sql: no rows in result set": "Sivua ei löydy",
    "[Network] Failed to fetch": "Ei verkkoyhteyttä",
};

const ErrorDisplay = (props) => {
    const { error } = props;
    const { isOpen, onToggle } = useDisclosure();

    const message = error && messages[error.message];

    return error ? (
        <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            justifyContent="center"
            textAlign="center"
            mb={4}
        >
            <AlertIcon size="2em" />
            <AlertTitle fontSize="lg" mt={4} mb={1}>
                {message || "On tapahtunut virhe!"}
            </AlertTitle>
            {!message ? (
                <React.Fragment>
                    <Button
                        variantColor="red"
                        variant="link"
                        my={2}
                        onClick={onToggle}
                    >
                        Lisätietoja
                    </Button>
                    <Collapse
                        textAlign="left"
                        as={Code}
                        fontSize="xs"
                        rounded="md"
                        p={2}
                        whiteSpace="pre-wrap"
                        isOpen={isOpen}
                    >
                        {JSON.stringify(props.error, null, 2)}
                    </Collapse>
                </React.Fragment>
            ) : null}
        </Alert>
    ) : null;
};

export default ErrorDisplay;
