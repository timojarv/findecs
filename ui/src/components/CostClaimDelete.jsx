import React, { useRef, useEffect } from "react";
import {
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    useToast,
} from "@chakra-ui/core";
import { useMutation } from "urql";
import { useHistory } from "react-router-dom";

const mutation = `
    mutation DeleteCostClaim($id: ID!) {
        deleteCostClaim(id: $id)
    }
`;

const CostClaimDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deleteCostClaim] = useMutation(mutation);
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

export default CostClaimDelete;
