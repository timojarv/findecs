import React, { useContext } from "react";
import { Box, Heading, Button, useToast } from "@chakra-ui/core";
import CostClaimForm from "../../forms/CostClaimForm";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";

const query = `
    query FetchCostClaim ($id: ID!) {
        costClaim(id: $id) {
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
            acceptedBy {
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
                attachment
            }
            total
        }
    }
`;

const mutation = `
    mutation UpdateCostClaim($id: ID!, $costClaim: CostClaimInput!, $receipts: [ReceiptInput!]!) {
        updateCostClaim(id: $id, costClaim: $costClaim, receipts: $receipts) {
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
            acceptedBy {
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
                attachment
            }
            total
        }
    }
`;

const EditCostClaim = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });
    const [update, updateCostClaim] = useMutation(mutation);
    const toast = useToast();

    const data = (result.data || {}).costClaim;

    const handleSubmit = (data) => {
        updateCostClaim({
            id,
            costClaim: {
                description: data.description,
                costPool: data.costPool,
                sourceOfMoney: data.sourceOfMoney,
                details: data.details,
            },
            receipts: data.receipts,
        }).then(({ error }) => {
            if (!error) {
                toast({
                    status: "success",
                    title: "Kulukorvaus päivitetty",
                    position: "top",
                });
                props.history.push(`/costClaims/${id}`);
            } else {
                toast({
                    status: "error",
                    title: "Jotain meni vikaan!",
                    description: error.message,
                    position: "top",
                });
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
                to={`/costClaims/${id}`}
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Muokkaa kulukorvausta
            </Heading>
            <ErrorDisplay error={result.error} />
            <CostClaimForm
                onSubmit={handleSubmit}
                isSubmitting={update.fetching}
                isLoading={result.fetching}
                data={data}
            />
        </Box>
    );
};

export default EditCostClaim;
