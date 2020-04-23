import React from 'react';
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Collapse,
    useDisclosure,
    Button,
    Code,
} from '@chakra-ui/core';

const ErrorDisplay = (props) => {
    const { isOpen, onToggle } = useDisclosure();

    return props.error ? (
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
                On tapahtunut virhe!
            </AlertTitle>
            <Button variantColor="red" variant="link" my={2} onClick={onToggle}>
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
        </Alert>
    ) : null;
};

export default ErrorDisplay;
