import React from "react";
import { useMutation } from "urql";
import { useMessage } from "../../util/message";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
} from "@chakra-ui/core";
import ContactForm from "../../forms/ContactForm";

const createMutation = `
    mutation CreateContact($contact: ContactInput!) {
        createContact(contact: $contact) {
            id
            name
            address
        }
    }
`;

const NewContact = (props) => {
    const { onClose, isOpen, onCreate } = props;

    const [creation, createContact] = useMutation(createMutation);
    const { successMessage, errorMessage } = useMessage();

    const handleCreate = (data) => {
        createContact({ contact: data }).then(({ error, data }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                successMessage("Yhteystieto luotu");
                onCreate(data.createContact);
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            closeOnOverlayClick={false}
            onClose={onClose}
            preserveScrollBarGap={true}
        >
            <ModalOverlay />
            <ModalContent rounded="md">
                <ModalHeader>Uusi yhteystieto</ModalHeader>
                <ModalBody>
                    <ContactForm
                        error={creation.error}
                        isSubmitting={creation.fetching}
                        onClose={onClose}
                        onSubmit={handleCreate}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default NewContact;
