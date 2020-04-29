import React from 'react'
import { FormControl, FormLabel, Input, Textarea, Flex, Button } from '@chakra-ui/core'
import { useForm } from 'react-hook-form';

const ContactForm = props => {
    const { onSubmit, onCancel, data } = props;
    const { register, handleSubmit } = useForm({ defaultValues: data });

    return (
        <form onSubmit={handleSubmit((form) => {
            if (typeof onSubmit === 'function')
                onSubmit(form);
        })}>
            <FormControl mb={4} isRequired>
                <FormLabel htmlFor="name">Nimi</FormLabel>
                <Input spellCheck={false} name="name" ref={register({ required: true })} />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel htmlFor="address">Osoitetiedot</FormLabel>
                <Textarea height={40} name="address" ref={register} />
            </FormControl>
            <Flex mb={4} justify="space-between">
                <Button onClick={onCancel} type="button">Peruuta</Button>
                <Button variantColor="indigo" type="submit" >Tallenna</Button>
            </Flex>
        </form>
    );
};

export default ContactForm;