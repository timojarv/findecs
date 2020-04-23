import React, { useState } from 'react';
import produce from 'immer';
import {
    FormControl,
    FormLabel,
    Input,
    Select,
    RadioGroup,
    Radio,
    Code,
    Stack,
    InputRightElement,
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
} from '@chakra-ui/core';
import { useQuery } from 'urql';
import { sourcesOfMoney } from '../util/metadata';
import FileInput from '../components/FileInput';
import { useForm } from 'react-hook-form';

const query = `
    query {
        costPools {
            id
            name
        }
    }
`;

const CostClaimForm = (props) => {
    const [result] = useQuery({ query });

    const [files, setFiles] = useState({});

    const { register, errors, handleSubmit } = useForm();

    const costPools = result.data ? result.data.costPools : [];

    const handleAddFiles = (fs) => {
        setFiles(
            produce(files, (draft) => {
                fs.filter((f) => !files[f.path]).forEach(
                    (f) => (draft[f.path] = f)
                );
            })
        );
    };

    const handleDeleteFile = (path) => {
        setFiles(
            produce(files, (draft) => {
                delete draft[path];
            })
        );
    };

    return (
        <form
            onSubmit={handleSubmit((form) => {
                if (typeof props.onSubmit === 'function')
                    props.onSubmit({ ...form, files });
            })}
        >
            <FormControl isRequired isInvalid={!!errors.description} mb={4}>
                <FormLabel htmlFor="description">Kuvaus</FormLabel>
                <Input
                    name="description"
                    type="text"
                    ref={register({ required: true })}
                />
                <FormHelperText>Lyhyt kuvaus kulukorvauksesta</FormHelperText>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.costPool} mb={4}>
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
            <FormControl isRequired isInvalid={!!errors.sourceOfMoney} mb={4}>
                <FormLabel htmlFor="sourceOfMoney">Rahan lähde</FormLabel>
                <RadioGroup name="sourceOfMoney" defaultValue="ownAccount">
                    {Object.entries(sourcesOfMoney).map(([key, label]) => (
                        <Radio
                            key={key}
                            value={key}
                            ref={register({ required: true })}
                        >
                            {label}
                        </Radio>
                    ))}
                </RadioGroup>
            </FormControl>
            <Heading as="h3" size="lg" my={6}>
                Kuitit
            </Heading>
            {Object.values(files).map((file, index) => (
                <Stack
                    key={file.path}
                    isInline
                    alignItems="flex-end"
                    spacing={4}
                    my={4}
                >
                    <FormControl
                        isRequired
                        isInvalid={!!errors[`receipts[${index}].date`]}
                    >
                        <FormLabel htmlFor={`receipts[${index}].date`}>
                            Päiväys
                        </FormLabel>
                        <Input
                            name={`receipts[${index}].date`}
                            type="date"
                            ref={register({ required: true })}
                        />
                    </FormControl>
                    <FormControl
                        isRequired
                        isInvalid={!!errors[`receipts[${index}].amount`]}
                    >
                        <FormLabel htmlFor={`receipts[${index}].amount`}>
                            Summa
                        </FormLabel>
                        <InputGroup>
                            <Input
                                name={`receipts[${index}].amount`}
                                type="number"
                                step="0.01"
                                borderBottomRightRadius={0}
                                borderTopRightRadius={0}
                                ref={register({ required: true })}
                            />
                            <InputRightAddon>€</InputRightAddon>
                        </InputGroup>
                    </FormControl>
                    <FormControl flexGrow={1}>
                        <FormLabel htmlFor={`receipts[${index}].fileName`}>
                            Tiedosto
                        </FormLabel>
                        <Input
                            isReadOnly
                            name={`receipts[${index}].fileName`}
                            value={file.name}
                            ref={register({ required: true })}
                        />
                    </FormControl>
                    <Popover>
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
                                src={URL.createObjectURL(file)}
                                size="sm"
                            />
                        </PopoverContent>
                    </Popover>
                    <IconButton
                        onClick={() => handleDeleteFile(file.path)}
                        icon="delete"
                        variantColor="red"
                    />
                </Stack>
            ))}
            <FileInput my={8} onChange={handleAddFiles} />
            <Button type="submit" variantColor="indigo" float="right">
                Luo kulukorvaus
            </Button>
        </form>
    );
};

export default CostClaimForm;
