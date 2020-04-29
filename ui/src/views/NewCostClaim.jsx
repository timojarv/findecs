import React, { useContext } from "react";
import { Box, Heading, Button, useToast } from "@chakra-ui/core";
import CostClaimForm from "../forms/CostClaimForm";
import { Link } from "react-router-dom";
import { useMutation } from "urql";
import { AuthContext } from "../util/auth";

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
            }
            total
        }
    }
`;

const NewCostClaim = (props) => {
    const [creation, createCostClaim] = useMutation(mutation);
    const toast = useToast();
    const user = useContext(AuthContext);

    const handleSubmit = (data) => {
        createCostClaim({
            costClaim: {
                description: data.description,
                costPool: data.costPool,
                sourceOfMoney: data.sourceOfMoney,
                details: data.details,
                author: user.id,
            },
            receipts: data.receipts,
        }).then(({ error, data }) => {
            if (!error) {
                toast({
                    status: "success",
                    title: "Kulukorvaus luotu",
                    position: "top",
                });
                props.history.push(`/costClaims/${data.createCostClaim.id}`);
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
                to="/costClaims"
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2" size="lg">
                Luo kulukorvaus
            </Heading>
            <CostClaimForm
                isLoading={creation.fetching}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default NewCostClaim;
