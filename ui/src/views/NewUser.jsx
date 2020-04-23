import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Heading,
    Box,
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
} from '@chakra-ui/core';
import { roles } from '../util/metadata';

const NewUser = (props) => {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Box maxWidth="400px" margin="auto" mt={8} as="form">
            <Heading mb={8}>Uusi käyttäjä</Heading>
            <FormControl isRequired mb={4}>
                <FormLabel htmlFor="name">Nimi</FormLabel>
                <Input type="text" name="name" />
                <FormErrorMessage>Nimi on jo käytössä</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid isRequired mb={4}>
                <FormLabel htmlFor="email">Sähköposti</FormLabel>
                <Input type="email" name="email" />
                <FormErrorMessage>Sähköposti ei kelpaa</FormErrorMessage>
            </FormControl>
            <FormControl isRequired mb={4}>
                <FormLabel htmlFor="role">Rooli</FormLabel>
                <Select name="role">
                    {Object.keys(roles).map((role, i) => (
                        <option value={role}>{roles[role].label}</option>
                    ))}
                </Select>
            </FormControl>
            <FormControl mb={4}>
                <FormLabel htmlFor="password">Salasana</FormLabel>
                <InputGroup>
                    <Input
                        type={isOpen ? 'text' : 'password'}
                        name="password"
                    />
                    <InputRightElement>
                        <IconButton
                            icon="view"
                            variant="ghost"
                            variantColor={isOpen ? 'indigo' : 'gray'}
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
                >
                    Takaisin
                </Button>
                <Button variantColor="indigo">Luo käyttäjä</Button>
            </Flex>
        </Box>
    );
};

export default NewUser;
