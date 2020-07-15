import React from "react";
import {
    Flex,
    Spinner,
    Input,
    Button,
    PseudoBox,
    Tooltip,
} from "@chakra-ui/core";
import { useMutation } from "urql";
import { useState } from "react";
import { useMessage } from "../util/message";
import { X } from "react-feather";

const mutation = `
    mutation SetCostClaimStatus($id: ID!, $status: Status!, $comment: String) {
        setCostClaimStatus(id: $id, status: $status, comment: $comment) {
            id
            status

            events {
                id
                status
                timestamp
                comment
            }

            approvedBy {
                id
                name
            }
        }
    }
`;

const revokeMutation = `
    mutation RevokeCostClaimStatus($id: ID!) {
        revokeCostClaimStatus(id: $id) {
            id
            status

            events {
                id
                status
                timestamp
                comment
            }

            approvedBy {
                id
                name
            }
        }
    }
`;



export const ApproveAction = (props) => {
    const { id } = props;
    const [comment, setComment] = useState("");
    const [{ fetching }, setStatus] = useMutation(mutation);
    const { errorMessage } = useMessage();

    const handleApprove = () => {
        setStatus({
            id,
            status: 'approved',
            comment: comment || null,
        }).then(res => res.error && errorMessage(res.error.message));
    };

    const handleReject = () => {
        setStatus({
            id,
            status: 'reject',
            comment: comment || null,
        }).then(res => res.error && errorMessage(res.error.message));
    };

    if (fetching) return (
        <Spinner color="blue.600" />
    );

    return (
        <Flex width={64} wrap="wrap" justify="space-between">
            <Input value={comment} onChange={e => setComment(e.target.value)} px={2} py={1} mb={1} placeholder="Kommentti (valinnainen)" />
            <Button onClick={handleReject} ml={2} px={2} py={1} ml={-1} variant="ghost" variantColor="red">
                Hylkää
            </Button>
            <Button onClick={handleApprove} px={2} py={1} mr={-1} variant="ghost" variantColor="green">
                Hyväksy
            </Button>
        </Flex>
    );
};

export const PaidAction = (props) => {
    const { id } = props;
    const [{ fetching }, setStatus] = useMutation(mutation);
    const { errorMessage } = useMessage();

    const handleClick = () => {
        setStatus({
            id,
            status: 'paid',
        }).then(res => res.error && errorMessage(res.error.message));
    };

    if (fetching) return (
        <Spinner color="blue.600" />
    );

    return (
        <Button onClick={handleClick} px={2} py={1} ml={-2} variant="ghost" variantColor="indigo">
            Merkitse maksetuksi
        </Button>
    );
};

export const RevokeAction = (props) => {
    const { id } = props;
    const [{ fetching }, revokeStatus] = useMutation(revokeMutation);
    const { errorMessage } = useMessage();

    const handleClick = () => {
        revokeStatus({
            id,
        }).then(res => res.error && errorMessage(res.error.message));
    };

    if (fetching) return (
        <Spinner color="blue.600" />
    );

    return (
        <PseudoBox _hover={{ color: 'gray.400' }} cursor="pointer" color="gray.300">
            <Tooltip label="Peruuta" placement="top">
                <X size="1em" onClick={handleClick} />
            </Tooltip>
        </PseudoBox>
    );
};