import React from 'react';
import { Box, Heading, Button } from '@chakra-ui/core';
import CostClaimForm from '../forms/CostClaimForm';
import { Link } from 'react-router-dom';

const NewCostClaim = (props) => {
    return (
        <Box maxWidth="900px" margin="auto">
            <Button
                my={4}
                variant="link"
                variantColor="indigo"
                leftIcon="arrow-back"
                as={Link}
                to="/costClaims"
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Luo kulukorvaus
            </Heading>
            <CostClaimForm onSubmit={console.log} />
        </Box>
    );
};

export default NewCostClaim;
