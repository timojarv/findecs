import React from "react";
import {
    Box,
    Heading,
    Divider,
    Text,
    Image,
    Stack,
    Spinner,
} from "@chakra-ui/core";
import { sourcesOfMoney } from "../../util/metadata";
import { formatCurrency, formatDate } from "../../util/format";
import { APIHost } from "../../util/api";
import { useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import IndecsLogo from "../../resources/indecs.svg";

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

const Label = (props) => (
    <Text display="block" fontSize="md" fontWeight="semibold" {...props} />
);

const Cell = (props) => <Box py={2} as="td" {...props} />;

const Claim = ({ claim }) => (
    <Box fontSize="lg" width="200mm" position="relative">
        <Image
            position="absolute"
            as={IndecsLogo}
            width="100%"
            opacity={0.04}
            zIndex={0}
            top={0}
        />
        <table width="100%">
            <thead>
                <tr>
                    <Box fontSize="lg" as="th" pb={6} textAlign="left">
                        Tuotantotalouden kilta Indecs ry
                    </Box>
                    <Box fontSize="lg" as="th" pb={6} textAlign="left">
                        Kulukorvaus
                    </Box>
                    <Box fontSize="lg" as="th" pb={6} textAlign="right">
                        {claim.runningNumber} / 2020
                    </Box>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <Cell>
                        <Label>Tekijä</Label>
                        {claim.author.name}
                    </Cell>
                    <Cell>
                        <Label>Toimi</Label>
                        Datatoimari
                    </Cell>
                </tr>
                <tr>
                    <Cell>
                        <Label>Puhelinnumero</Label>
                        0404465212
                    </Cell>
                    <Cell>
                        <Label>Sähköposti</Label>
                        {claim.author.email}
                    </Cell>
                </tr>
                <tr>
                    <Cell>
                        <Label>Rahan lähde</Label>
                        {sourcesOfMoney[claim.sourceOfMoney]}
                    </Cell>
                    <Cell>
                        <Label>IBAN</Label>-
                    </Cell>
                </tr>
                <tr>
                    <Cell>
                        <Label>Kustannuspaikka</Label>
                        {claim.costPool.name}
                    </Cell>
                    <Cell>
                        <Label>Kuvaus</Label>
                        {claim.description}
                    </Cell>
                </tr>
                <tr style={{ borderTop: "1px solid lightgray" }}>
                    <Cell>
                        <Label>Kuitit</Label>
                    </Cell>
                    <Cell>
                        <Label>Päiväys</Label>
                    </Cell>
                    <Cell>
                        <Label>Summa</Label>
                    </Cell>
                </tr>
                {claim.receipts.map((receipt) => (
                    <tr key={receipt.id}>
                        <Cell></Cell>
                        <Cell>{formatDate(receipt.date)}</Cell>
                        <Cell>{formatCurrency(receipt.amount)}</Cell>
                    </tr>
                ))}
                <tr
                    style={{
                        borderBottom: "1px solid lightgray",
                        borderTop: "21x solid light",
                    }}
                >
                    <Cell></Cell>
                    <Cell>
                        <strong>Yhteensä:</strong>
                    </Cell>
                    <Cell>{formatCurrency(claim.total)}</Cell>
                </tr>
                <tr>
                    <Cell>
                        <Label>Paikka ja päiväys</Label>
                        Tampere, {formatDate(claim.modified)}
                    </Cell>
                    <Cell>
                        <Label>Allekirjoitus</Label>-
                    </Cell>
                </tr>
                <tr>
                    <Cell>
                        <Label>Huomatus</Label>
                    </Cell>
                    <Cell>
                        <Label>Hyväksyjän kuittaus</Label>
                    </Cell>
                </tr>
            </tbody>
        </table>
        <Divider my={6} />
        <Heading as="h3" size="md" mb={6}>
            Liitteet
        </Heading>
        <Stack spacing={8} direction="row" flexWrap="wrap">
            {claim.receipts.map((receipt) => (
                <Image
                    key={receipt.id}
                    mb={3}
                    src={`${APIHost}/upload/receipts/${receipt.attachment}`}
                />
            ))}
        </Stack>
    </Box>
);

const PrintCostClaim = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });

    return (
        <Box maxWidth="800px" margin="auto">
            {result.fetching ? (
                <Spinner color="indigo.500" display="block" />
            ) : null}
            <ErrorDisplay error={result.error} />
            {result.data ? <Claim claim={result.data.costClaim} /> : null}
        </Box>
    );
};

export default PrintCostClaim;
