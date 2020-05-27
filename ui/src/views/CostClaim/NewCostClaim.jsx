import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import CostClaimForm from "../../forms/CostClaimForm";
import { Link } from "react-router-dom";
import { useMutation } from "urql";
import { useMessage } from "../../util/message";

const mutation = `
    mutation CreateCostClaim($costClaim: CostClaimInput!, $receipts: [ReceiptInput!]!) {
        createCostClaim(costClaim: $costClaim, receipts: $receipts) {
            id
            description
            runningNumber
            author {
                id
                name
                email
            }
            details
            created
            modified
            status
            approvedBy {
                id
                name
                email
            }
            sourceOfMoney
            costPool {
                id
                name
            }
            receipts {
                id
                date
                amount
            }
            total
        }
    }
`;

const NewCostClaim = (props) => {
    const [creation, createCostClaim] = useMutation(mutation);
    const { successMessage, errorMessage } = useMessage();

    const handleSubmit = (data) => {
        createCostClaim({
            costClaim: {
                description: data.description,
                costPool: data.costPool,
                sourceOfMoney: data.sourceOfMoney,
                details: data.details,
            },
            receipts: data.receipts,
        }).then(({ error, data }) => {
            if (!error) {
                successMessage("Kulukorvaus luotu");
                props.history.push(`/costClaims/${data.createCostClaim.id}`);
            } else {
                errorMessage(error.message);
            }
        });
    };

    return (
        <Box maxWidth="800px" margin="auto">
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
                Uusi kulukorvaus
            </Heading>
            <CostClaimForm
                isLoading={creation.fetching}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default NewCostClaim;
