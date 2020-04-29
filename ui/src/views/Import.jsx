import React, { useState } from 'react'
import { Box, Heading, Textarea, Button, Input, FormControl, FormLabel, Progress } from '@chakra-ui/core';
import { useForm } from 'react-hook-form';
import { useClient, createRequest } from 'urql';

const Import = props => {
    const { register, handleSubmit } = useForm();
    const client = useClient();
    const [total, setTotal] = useState(0);
    const [done, setDone] = useState(0);

    const onSubmit = data => {
        console.log(data)
        const items = JSON.parse(data.json)[data.key];
        setTotal(items.length);
        const create = items.map(item => client.mutation(data.mutation, item).toPromise().then(setDone(done + 1)));
        Promise.all(create).then(() => {
            setDone(0);
            setTotal(0);
        })
    };

    return (
        <Box as="form" pt={8} onSubmit={handleSubmit(onSubmit)}>
            <Heading as="h2" size="lg">Tuo tietoja</Heading>
            {total ? <Progress value={done / total * 100} /> : null}
            <Textarea name="json" height="lg" mt={8} mb={4} placeholder="Liitä JSON..." ref={register} />
            <FormControl mb={4}>
                <FormLabel>Avain</FormLabel>
                <Input name="key" ref={register} />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Mutaatio</FormLabel>
                <Input name="mutation" ref={register} />
            </FormControl>
            <Button type="submit" variantColor="indigo" float="right">Tuo tiedot</Button>
        </Box>
    );
};

export default Import;