import React, { useRef } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import {
    Box,
    Heading,
    Divider,
    Flex,
    Button,
    Text,
    Image,
    Stack,
    IconButton,
    Link,
    Badge,
    Spinner,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    useToast,
} from "@chakra-ui/core";
import { Printer, Edit, Trash2 } from "react-feather";
import { DL, DT, DD } from "../../components/DescriptionList";
import { statuses, statusColors, sourcesOfMoney } from "../../util/metadata";
import { formatDateTime, formatCurrency, formatDate } from "../../util/format";
import { APIHost } from "../../util/api";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";

const query = `
    query FetchCostClaim ($id: ID!) {
        costClaim(id: $id) {
            id
            description
            runningNumber
            author {
                id
                name
                email
            }
            details
            created
            modified
            status
            acceptedBy {
                id
                name
                email
            }
            sourceOfMoney
            costPool {
                id
                name
            }
            receipts {
                id
                date
                amount
                attachment
            }
            total
        }
    }
`;

const deleteMutation = `
    mutation DeleteCostClaim($id: ID!) {
        deleteCostClaim(id: $id)
    }
`;

const CostClaimDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deleteCostClaim] = useMutation(deleteMutation);
    const toast = useToast();
    const history = useHistory();

    const handleDelete = () => {
        deleteCostClaim({ id }).then(({ error }) => {
            if (error) {
                toast({
                    status: "error",
                    title: "Tapahtui virhe!",
                    description: error.message,
                    position: "top",
                });
            } else {
                toast({
                    status: "info",
                    title: "Kulukorvaus poistettu",
                    position: "top",
                });
                history.push("/costClaims");
            }
        });
    };

    return (
        <React.Fragment>
            {React.cloneElement(children, { onClick: onOpen })}
            <AlertDialog
                leastDestructiveRef={cancelRef}
                isOpen={isOpen}
                onClose={onClose}
                preserveScrollBarGap={true}
            >
                <AlertDialogOverlay />
                <AlertDialogContent rounded="md">
                    <AlertDialogHeader>Poista kulukorvaus</AlertDialogHeader>
                    <AlertDialogBody>
                        Oletko varma? Toimintoa ei voi perua.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Peruuta
                        </Button>
                        <Button
                            isLoading={deletion.fetching}
                            onClick={handleDelete}
                            variantColor="red"
                            ml={3}
                        >
                            Poista
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </React.Fragment>
    );
};

const renderClaim = (claim) =>
    claim ? (
        <React.Fragment>
            <Flex align="baseline">
                <Heading flexGrow={1} as="h2">
                    {claim.description}
                </Heading>
            </Flex>
            <Flex align="center" my={4}>
                <Text fontSize="lg" color="gray.600">
                    {claim.runningNumber} / 2020
                </Text>
                <Text color="gray.500" mx={3}>
                    &bull;
                </Text>
                <Badge
                    rounded="md"
                    py={1}
                    px={2}
                    variantColor={statusColors[claim.status]}
                >
                    {statuses[claim.status]}
                </Badge>
                <Box flexGrow={1} />
                <Button
                    flexShrink={0}
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    as={RouterLink}
                    target="_blank"
                    to={`/costClaims/${claim.id}/print`}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Tulosta
                    </Text>
                    <Printer size="1em" />
                </Button>
                <Button
                    flexShrink={0}
                    ml={4}
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    as={RouterLink}
                    to={`/costClaims/${claim.id}/edit`}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Muokkaa
                    </Text>
                    <Edit size="1em" />
                </Button>
                <CostClaimDelete id={claim.id}>
                    <Button
                        flexShrink={0}
                        ml={4}
                        variant="outline"
                        variantColor="red"
                        size="sm"
                    >
                        <Text display={["none", "inline-block"]} mr={2}>
                            Poista
                        </Text>
                        <Trash2 size="1em" />
                    </Button>
                </CostClaimDelete>
            </Flex>
            <DL>
                <DT>Summa</DT>
                <DD>{formatCurrency(claim.total)}</DD>
                <DT>Tekijä</DT>
                <DD>
                    <Link color="indigo.700">
                        {claim.author.name} &lt;{claim.author.email}&gt;
                    </Link>
                </DD>
                <DT>Kustannuspaikka</DT>
                <DD>
                    <Link
                        as={RouterLink}
                        to={`/costPools/${claim.costPool.id}`}
                        color="indigo.700"
                    >
                        {claim.costPool.name}
                    </Link>
                </DD>
                <DT>Rahan lähde</DT>
                <DD>{sourcesOfMoney[claim.sourceOfMoney]}</DD>
                <DT>Luotu</DT>
                <DD>{formatDateTime(claim.created)}</DD>
                <DT>Muokattu</DT>
                <DD>{claim.modified ? formatDateTime(claim.modified) : "-"}</DD>
                <DT>Lisätiedot</DT>
                <DD>{claim.details || "-"}</DD>
            </DL>
            <Divider my={6} />
            <Heading as="h3" size="md" mb={6}>
                Kuitit
            </Heading>
            <Stack spacing={8} direction="row" flexWrap="wrap">
                {claim.receipts.map((receipt) => (
                    <Box
                        key={receipt.id}
                        width="sm"
                        rounded="lg"
                        border="1px"
                        borderColor="gray.300"
                        p={3}
                        mb={4}
                    >
                        <Image
                            mb={3}
                            rounded="md"
                            size="full"
                            height="260px"
                            objectFit="cover"
                            shadow="sm"
                            src={`${APIHost}/upload/receipts/${receipt.attachment}`}
                        />
                        <Flex align="baseline">
                            <Text fontSize="xl" fontWeight="semibold">
                                {formatCurrency(receipt.amount)}
                            </Text>
                            <Text mx={2} color="gray.200">
                                &bull;
                            </Text>
                            <Text flexGrow={1} color="gray.600">
                                {formatDate(receipt.date)}
                            </Text>
                            <Link
                                isExternal
                                href={`${APIHost}/upload/receipts/${receipt.attachment}`}
                            >
                                <IconButton
                                    size="sm"
                                    icon="attachment"
                                    variantColor="indigo"
                                    variant="outline"
                                />
                            </Link>
                        </Flex>
                    </Box>
                ))}
            </Stack>
        </React.Fragment>
    ) : null;

const CostClaim = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });

    return (
        <Box maxWidth="800px" margin="auto">
            <Button
                as={RouterLink}
                leftIcon="arrow-back"
                variant="link"
                variantColor="indigo"
                to="/costClaims"
                my={4}
            >
                Takaisin
            </Button>
            {result.fetching ? (
                <Spinner color="indigo.500" display="block" />
            ) : null}
            <ErrorDisplay error={result.error} />
            {result.data ? renderClaim(result.data.costClaim) : null}
        </Box>
    );
};

export default CostClaim;
