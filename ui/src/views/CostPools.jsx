import React from 'react';
import {
    Heading,
    Box,
    Spinner,
    IconButton,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightAddon,
    Flex,
    useToast,
} from '@chakra-ui/core';
import { useQuery, useMutation } from 'urql';
import { useForm } from 'react-hook-form';
import ErrorDisplay from '../components/ErrorDisplay';
import {
    TableContainer,
    Table,
    THead,
    TR,
    TH,
    TBody,
    TD,
} from '../components/Table';
import { formatCurrency } from '../util/format';

const query = `
    query FetchCostPools {
        costPools {
            id
            name
            budget
            total
        }
    }
`;

const mutation = `
    mutation CreateCostPool ($costPool: CostPoolInput!) {
        createCostPool(costPool: $costPool) {
            id
            name
            budget
            total
        }
    }
`;

const renderCostPools = (pools) => (
    <TableContainer>
        <Table>
            <THead>
                <TR>
                    <TH textAlign="left">Nimi</TH>
                    <TH textAlign="right">Budjetti</TH>
                    <TH textAlign="right">Käytetty</TH>
                    <TH textAlign="right">Jäljellä</TH>
                    <TH></TH>
                </TR>
            </THead>
            <TBody>
                {(pools || []).map((pool) => (
                    <TR key={pool.id}>
                        <TD fontWeight="semibold">{pool.name}</TD>
                        <TD textAlign="right">{formatCurrency(pool.budget)}</TD>
                        <TD textAlign="right">{formatCurrency(pool.total)}</TD>
                        <TD textAlign="right">
                            {formatCurrency(pool.budget - pool.total)}
                        </TD>
                        <TD
                            textAlign="center"
                            display="flex"
                            justifyContent="flex-end"
                        >
                            <IconButton
                                variant="ghost"
                                variantColor="indigo"
                                icon="edit"
                                mr={4}
                            />
                            <IconButton
                                variant="ghost"
                                variantColor="red"
                                icon="delete"
                            />
                        </TD>
                    </TR>
                ))}
            </TBody>
        </Table>
    </TableContainer>
);

const CostPools = (props) => {
    const [result, reFetch] = useQuery({ query });
    const [creation, createCostPool] = useMutation(mutation);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { register, handleSubmit, errors } = useForm();

    const onSubmit = (data) => {
        createCostPool({ costPool: data }).then((res) => {
            if (!res.error) {
                onClose();
                reFetch();
                toast({
                    title: 'Kustannuspaikka luotu!',
                    status: 'success',
                    duration: 2500,
                    position: 'top',
                });
            }
        });
    };

    return (
        <Box maxWidth="800px" margin="auto" pt={8}>
            <Heading>Kustannuspaikat</Heading>
            <Button
                leftIcon="add"
                variantColor="indigo"
                my={6}
                onClick={onOpen}
            >
                Luo uusi
            </Button>
            {result.fetching ? (
                <Spinner color="indigo.500" size="xl" display="block" />
            ) : null}
            <ErrorDisplay error={result.error} />
            {!result.error && result.data
                ? renderCostPools(result.data.costPools)
                : null}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>Luo kustannuspaikka</ModalHeader>
                    <ModalBody>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormControl
                                isInvalid={!!errors.name}
                                isRequired
                                mb={4}
                            >
                                <FormLabel htmlFor="name">Nimi</FormLabel>
                                <Input
                                    name="name"
                                    type="text"
                                    ref={register({ required: true })}
                                />
                            </FormControl>
                            <FormControl
                                isInvalid={!!errors.budget}
                                isRequired
                                mb={8}
                            >
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
                                    isLoading={mutation.fetching}
                                >
                                    Luo kustannuspaikka
                                </Button>
                            </Flex>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default CostPools;
