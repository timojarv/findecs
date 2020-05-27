import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import CostClaimForm from "../../forms/CostClaimForm";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

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
            approvedBy {
                id
                name
                email
            }
            sourceOfMoney
            otherIban
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
            approvedBy {
                id
                name
                email
            }
            sourceOfMoney
            otherIban
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
    const { infoMessage, errorMessage } = useMessage();

    const data = (result.data || {}).costClaim;

    const handleSubmit = (data) => {
        updateCostClaim({
            id,
            costClaim: {
                description: data.description,
                costPool: data.costPool,
                sourceOfMoney: data.sourceOfMoney,
                details: data.details,
                otherIban: data.otherIban || null,
            },
            receipts: data.receipts,
        }).then(({ error }) => {
            if (!error) {
                infoMessage("Kulukorvaus päivitetty");
                props.history.push(`/costClaims/${id}`);
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
