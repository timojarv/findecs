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
    Spinner,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Input,
    Badge,
} from "@chakra-ui/core";
import { Printer, Edit, Trash2, Circle, CheckCircle, AlertCircle, Clock, ArrowRightCircle } from "react-feather";
import { DL, DT, DD } from "../../components/DescriptionList";
import { sourcesOfMoney, statusColors, statuses } from "../../util/metadata";
import { formatDateTime, formatCurrency, formatDate } from "../../util/format";
import { APIHost } from "../../util/api";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";
import { useAccess } from "../../util/hooks";
import TimeLine from "../../components/TimeLine";
import { ApproveAction, PaidAction, RevokeAction } from "../../components/StatusActions";

const query = `
    query FetchCostClaim ($id: ID!) {
        costClaim(id: $id) {
            id
            description
            runningNumber
            author {
                id
                name
            }
            details
            created
            modified
            status
            approvedBy {
                id
                name
            }
            sourceOfMoney
            otherIban
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
            events {
                id
                status
                timestamp
                comment
            }
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
    const { infoMessage, errorMessage } = useMessage();
    const history = useHistory();

    const handleDelete = () => {
        deleteCostClaim({ id }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                infoMessage("Kulukorvaus poistettu");
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

const getSteps = (claim, access) => {
    const steps = [
        {
            icon: Circle,
            title: 'Kulukorvaus luotu',
            datetime: formatDateTime(claim.created),
            comment: claim.modified ? `Muokattu ${formatDateTime(claim.modified)}` : null,
        },
    ];

    for (const event of claim.events) {
        let icon = Circle;
        let color = 'gray';
        let title = '';

        switch (event.status) {
            case 'approved':
                icon = CheckCircle;
                color = 'green';
                title = 'Hyväksytty';
                break;
            case 'rejected':
                icon = AlertCircle;
                color = 'red';
                title = 'Hylätty';
                break;
            case 'paid':
                icon = CheckCircle;
                color = 'indigo';
                title = 'Maksettu';
                break;
        }

        steps.push({
            icon,
            color,
            title,
            datetime: formatDateTime(event.timestamp),
            comment: event.comment,
        });
    }

    if (steps.length > 1) {
        steps[steps.length - 1].delete = <RevokeAction id={claim.id} />
    }

    if (steps.length === 1) {
        if (access("admin") === "none") {
            steps.push({
                title: 'Odottaa hyväksyntää',
                icon: Clock,
            });
        } else {
            steps.push({
                icon: ArrowRightCircle,
                actions: <ApproveAction id={claim.id} />,
            })
        }
    } else if (claim.events[claim.events.length - 1].status === 'approved') {
        steps.push({
            icon: ArrowRightCircle,
            actions: <PaidAction id={claim.id} />,
        })
    }

    return steps;
};

const renderClaim = (claim, access, revokeStatus) =>
    claim ? (
        <React.Fragment>
            <Flex align="baseline">
                <Heading flexGrow={1} as="h2">
                    {claim.description}
                </Heading>
            </Flex>
            <Flex align="center" mt={2} mb={6}>
                <Text fontSize="lg" color="gray.600">
                    {claim.runningNumber} / 2020
                </Text>
                <Text color="gray.400" mx={3}>
                    &bull;
                </Text>
                <Badge
                    rounded="md"
                    as={Flex}
                    py={1}
                    px={2}
                    variantColor={statusColors[claim.status]}
                >
                    {statuses[claim.status]}
                </Badge>
                <Box flexGrow={1} />
                <Button
                    flexShrink={0}
                    variant="ghost"
                    variantColor="indigo"
                    as={RouterLink}
                    target="_blank"
                    to={`/costClaims/${claim.id}/print`}
                    ml={4}
                >
                    <Printer size="1.2em" />
                </Button>
                <Button
                    flexShrink={0}
                    ml={4}
                    variant="ghost"
                    variantColor="indigo"
                    as={RouterLink}
                    to={`/costClaims/${claim.id}/edit`}
                    display={access("admin", ['rejected', 'created'].includes(claim.status)) || 'inline-flex'}
                >
                    <Edit size="1.2em" />
                </Button>
                <CostClaimDelete id={claim.id}>
                    <Button
                        flexShrink={0}
                        ml={4}
                        variant="ghost"
                        variantColor="red"
                        display={access("admin") || 'inline-flex'}
                    >
                        <Trash2 size="1.2em" />
                    </Button>
                </CostClaimDelete>
            </Flex>
            <Flex justify="space-between">
                <DL mt={3}>
                    <DT>Summa</DT>
                    <DD>{formatCurrency(claim.total)}</DD>
                    <DT>Tekijä</DT>
                    <DD>
                        <Link
                            as={RouterLink}
                            to={`/users/${claim.author.id}`}
                            color="indigo.700"
                        >
                            {claim.author.name}
                        </Link>
                    </DD>
                    {claim.approvedBy ? (
                        <React.Fragment>
                            <DT>Hyväksyjä</DT>
                            <DD>
                                <Link
                                    as={RouterLink}
                                    color="indigo.700"
                                    to={`/users/${claim.approvedBy.id}`}
                                >
                                    {claim.approvedBy.name}
                                </Link>
                            </DD>
                        </React.Fragment>
                    ) : null}
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
                    {claim.details ? (
                        <React.Fragment>
                            <DT>Lisätiedot</DT>
                            <DD>{claim.details}</DD>
                        </React.Fragment>
                    ) : null}
                </DL>
                <TimeLine steps={getSteps(claim, access)} />
            </Flex>
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
    const access = useAccess();

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
            {result.data ? renderClaim(result.data.costClaim, access) : null}
        </Box>
    );
};

export default CostClaim;
