import React, { useState, useEffect } from "react";
import * as yup from "yup";
import {
    FormControl,
    FormLabel,
    Input,
    Select,
    RadioGroup,
    Radio,
    Stack,
    InputGroup,
    Heading,
    IconButton,
    InputRightAddon,
    Image,
    Popover,
    PopoverTrigger,
    PopoverContent,
    FormHelperText,
    Button,
    Textarea,
    FormErrorMessage,
    Code,
} from "@chakra-ui/core";
import { useQuery } from "urql";
import { sourcesOfMoney } from "../util/metadata";
import FileInput from "../components/FileInput";
import { useForm, useFieldArray } from "react-hook-form";
import { APIHost } from "../util/api";

const query = `
    query FetchCostPools {
        costPools(limit: null) {
            id
            name
        }
    }
`;

const schema = yup.object().shape({
    description: yup.string().required(),
    costPool: yup.string().required(),
    sourceOfMoney: yup.string().required(),
    details: yup.string(),
    receipts: yup
        .array()
        .of(
            yup.object().shape({
                date: yup.string().required(),
                amount: yup.number().required().min(0.01),
                id: yup.string(),
                file: yup.object(),
            })
        )
        .required()
        .min(1),
});

const CostClaimForm = (props) => {
    const { isLoading, isSubmitting, onSubmit, data } = props;

    const [result] = useQuery({ query });
    const {
        register,
        errors,
        handleSubmit,
        clearError,
        reset,
        control,
    } = useForm({ validationSchema: schema });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "receipts",
        keyName: "key",
    });

    useEffect(() => {
        if (!data) return;
        reset({
            ...data,
            author: data.author.id,
            costPool: data.costPool.id,
        });
    }, [data, reset, append]);

    const costPools = result.data ? result.data.costPools : [];

    const handleAddFiles = (files) => {
        files.forEach((file) => {
            append({
                attachment: file.name,
                file,
            });
        });

        clearError("receipts");
    };

    const handleDeleteFile = (index) => {
        remove(index);
    };

    return (
        <form
            onSubmit={handleSubmit((form) => {
                onSubmit({
                    ...form,
                    receipts: form.receipts.map((receipt, index) => ({
                        ...receipt,
                        file: fields[index].file,
                    })),
                });
            })}
        >
            <FormControl
                isDisabled={isLoading}
                isRequired
                isInvalid={!!errors.description}
                mb={4}
            >
                <FormLabel htmlFor="description">Kuvaus</FormLabel>
                <Input
                    name="description"
                    type="text"
                    ref={register({ required: true })}
                />
                <FormHelperText>Lyhyt kuvaus kulukorvauksesta</FormHelperText>
            </FormControl>
            <FormControl
                isDisabled={isLoading}
                isRequired
                isInvalid={!!errors.costPool}
                mb={4}
            >
                <FormLabel htmlFor="costPool">Kustannuspaikka</FormLabel>
                <Select
                    name="costPool"
                    placeholder="Valitse kustannuspaikka"
                    ref={register({ required: true })}
                >
                    {costPools.map(({ name, id }) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </Select>
            </FormControl>
            <FormControl
                isDisabled={isLoading}
                isRequired
                isInvalid={!!errors.sourceOfMoney}
                mb={4}
            >
                <FormLabel htmlFor="sourceOfMoney">Rahan lähde</FormLabel>
                <RadioGroup name="sourceOfMoney" defaultValue="ownAccount">
                    {Object.entries(sourcesOfMoney).map(([key, label]) => (
                        <Radio
                            isDisabled={isLoading}
                            key={key}
                            value={key}
                            ref={register({ required: true })}
                        >
                            {label}
                        </Radio>
                    ))}
                </RadioGroup>
            </FormControl>
            <FormControl isDisabled={isLoading}>
                <FormLabel>Lisätietoja</FormLabel>
                <Textarea name="details" ref={register} />
            </FormControl>
            <FormControl
                isInvalid={errors.receipts && !Array.isArray(errors.receipts)}
            >
                <Heading as="h3" size="lg" my={6}>
                    Kuitit
                </Heading>
                <FormErrorMessage>Lisää vähintään yksi kuitti</FormErrorMessage>
            </FormControl>
            {fields.map((receipt, index) => (
                <Stack
                    key={receipt.key}
                    isInline
                    alignItems="flex-end"
                    spacing={4}
                    my={4}
                >
                    <Input
                        name={`receipts[${index}].id`}
                        ref={register()}
                        value={receipt.id}
                        display="none"
                        isReadOnly
                    />
                    <FormControl
                        flexGrow={1}
                        isRequired
                        isInvalid={
                            errors.receipts &&
                            !!(errors.receipts[index] || {}).date
                        }
                    >
                        <FormLabel htmlFor={`receipts[${index}].date`}>
                            Päiväys
                        </FormLabel>
                        <Input
                            name={`receipts[${index}].date`}
                            type="date"
                            defaultValue={receipt.date}
                            ref={register({ required: true })}
                        />
                    </FormControl>
                    <FormControl
                        flexGrow={1}
                        isRequired
                        isInvalid={
                            errors.receipts &&
                            !!(errors.receipts[index] || {}).amount
                        }
                    >
                        <FormLabel htmlFor={`receipts[${index}].amount`}>
                            Summa
                        </FormLabel>
                        <InputGroup>
                            <Input
                                name={`receipts[${index}].amount`}
                                borderBottomRightRadius={0}
                                borderTopRightRadius={0}
                                ref={register({ required: true })}
                                type="number"
                                step="0.01"
                                defaultValue={receipt.amount}
                            />
                            <InputRightAddon>€</InputRightAddon>
                        </InputGroup>
                    </FormControl>
                    <Popover placement="left">
                        <PopoverTrigger>
                            <IconButton
                                mr={4}
                                icon="view"
                                variantColor="indigo"
                            />
                        </PopoverTrigger>
                        <PopoverContent
                            border="1px"
                            borderColor="gray.300"
                            rounded="md"
                            shadow="md"
                            overflow="hidden"
                            p={0}
                            zIndex={1000}
                        >
                            <Image
                                objectFit="cover"
                                src={
                                    receipt.file
                                        ? URL.createObjectURL(receipt.file)
                                        : `${APIHost}/upload/receipts/${receipt.attachment}`
                                }
                                maxWidth="md"
                                maxHeight="md"
                            />
                        </PopoverContent>
                    </Popover>
                    <IconButton
                        onClick={() => handleDeleteFile(index)}
                        icon="delete"
                        variantColor="red"
                    />
                </Stack>
            ))}
            <FileInput
                isDisabled={isLoading}
                my={8}
                onChange={handleAddFiles}
                accept="image/*"
            />
            <FormControl textAlign="right">
                <Button
                    isLoading={isSubmitting}
                    type="submit"
                    variantColor="indigo"
                >
                    {data ? "Tallenna" : "Luo kulukorvaus"}
                </Button>
            </FormControl>
        </form>
    );
};

export default CostClaimForm;
