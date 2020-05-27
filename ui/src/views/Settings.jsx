import React, { useEffect } from "react";
import {
    Box,
    Heading,
    Input,
    FormControl,
    FormLabel,
    Flex,
    Button,
    FormErrorMessage,
    FormHelperText,
} from "@chakra-ui/core";
import * as yup from "yup";
import { useForm, ErrorMessage } from "react-hook-form";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../components/ErrorDisplay";
import Signature from "../components/Signature";
import { useMessage } from "../util/message";

const query = `
    query GetUserSettings {
        user {
            id
            name
            email
            iban
            phone
            position
            signature
        }
    }
`;

const mutation = `
    mutation UpdateSettings($settings: SettingsInput!) {
        updateSettings(settings: $settings) {
            id
            name
            email
            iban
            phone
            position
            signature
        }
    }
`;

const schema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().required(),
    phone: yup.string(),
    position: yup.string(),
    iban: yup.string(),
    newPassword: yup.string(),
    newPasswordConfirm: yup.string().oneOf([yup.ref("newPassword")]),
});

const Settings = (props) => {
    const { register, handleSubmit, reset, watch, errors } = useForm({
        validationSchema: schema,
    });
    const [result] = useQuery({ query });
    const [update, updateSettings] = useMutation(mutation);
    const { infoMessage, errorMessage } = useMessage();

    const { fetching, error, data } = result;

    const sf = watch("signatureFile");
    const newSignature = sf && sf.length ? sf[0] : null;

    console.log(newSignature && URL.createObjectURL(newSignature));

    useEffect(() => {
        if (data) {
            reset(data.user);
        }
    }, [data, reset]);

    const onSubmit = ({
        newPasswordConfirm,
        signatureFile,
        newPassword,
        ...data
    }) => {
        updateSettings({
            settings: {
                ...data,
                signature: signatureFile.length ? signatureFile[0] : null,
                newPassword: newPassword.length ? newPassword : null,
            },
        }).then(({ error }) => {
            if (error) {
                errorMessage(error.msg);
            } else {
                infoMessage("Tiedot päivitetty");
            }
        });
    };

    return (
        <Box
            as="form"
            pt={8}
            maxWidth="800px"
            margin="auto"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Heading mb={8} as="h2">
                Asetukset
            </Heading>
            <ErrorDisplay error={error} />
            <Flex wrap="wrap">
                <FormControl
                    isDisabled={fetching}
                    width={["100%", "50%"]}
                    pr={[0, 2]}
                    display="inline-block"
                    mb={4}
                    isRequired
                >
                    <FormLabel>Nimi</FormLabel>
                    <Input name="name" ref={register({ required: true })} />
                </FormControl>
                <FormControl
                    isDisabled={fetching}
                    width={["100%", "50%"]}
                    pl={[0, 2]}
                    display="inline-block"
                    mb={4}
                    isRequired
                >
                    <FormLabel>Sähköposti</FormLabel>
                    <Input
                        name="email"
                        type="email"
                        ref={register({ required: true })}
                    />
                </FormControl>
                <FormControl
                    isDisabled={fetching}
                    width={["100%", "50%"]}
                    pr={[0, 2]}
                    display="inline-block"
                    mb={4}
                >
                    <FormLabel>Puhelinnumero</FormLabel>
                    <Input name="phone" ref={register()} />
                </FormControl>
                <FormControl
                    isDisabled={fetching}
                    width={["100%", "50%"]}
                    pl={[0, 2]}
                    display="inline-block"
                    mb={4}
                >
                    <FormLabel>Toimi</FormLabel>
                    <Input name="position" ref={register()} />
                </FormControl>
                <FormControl
                    isDisabled={fetching}
                    width="100%"
                    display="inline-block"
                    mb={4}
                >
                    <FormLabel>Tilinumero</FormLabel>
                    <Input name="iban" ref={register()} />
                </FormControl>
                <FormControl
                    isDisabled={fetching}
                    width="100%"
                    display="inline-block"
                    mb={4}
                >
                    <FormLabel>Allekirjoitus</FormLabel>
                    <Input type="file" name="signatureFile" ref={register()} />
                </FormControl>
                <Box width="100%">
                    {data && data.user.signature && !newSignature ? (
                        <Signature mb={4} filename={data.user.signature} />
                    ) : null}
                    {newSignature ? (
                        <Signature
                            mb={4}
                            src={URL.createObjectURL(newSignature)}
                        />
                    ) : null}
                </Box>
                <FormControl
                    isDisabled={fetching}
                    width={["100%", "50%"]}
                    pr={[0, 2]}
                    display="inline-block"
                    mb={4}
                >
                    <FormLabel>Uusi salasana</FormLabel>
                    <Input
                        name="newPassword"
                        type="password"
                        ref={register()}
                    />
                    <FormHelperText>
                        Jätä tyhjäksi, mikäli et halua vaihtaa salasanaa.
                    </FormHelperText>
                </FormControl>
                <FormControl
                    isDisabled={fetching}
                    width={["100%", "50%"]}
                    pl={[0, 2]}
                    display="inline-block"
                    mb={4}
                    isInvalid={errors.newPasswordConfirm}
                >
                    <FormLabel>Vahvista salasana</FormLabel>
                    <Input
                        name="newPasswordConfirm"
                        type="password"
                        ref={register()}
                    />
                    <FormErrorMessage>Salasanat eivät täsmää</FormErrorMessage>
                </FormControl>
            </Flex>
            <Flex pt={4} justify="flex-end">
                <Button
                    isLoading={update.fetching}
                    type="submit"
                    variantColor="indigo"
                >
                    Tallenna
                </Button>
            </Flex>
        </Box>
    );
};

export default Settings;
