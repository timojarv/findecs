import React from "react";
import { Box, Heading, Text, Spinner, Flex, css } from "@chakra-ui/core";
import { formatCurrency, formatDate, referenceNumber } from "../../util/format";
import { useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import config from "../../util/config";

const query = `
    query FetchSalesInvoice ($id: ID!) {
        salesInvoice(id: $id) {
            id
            runningNumber
            details
            date
            dueDate
            status
            recipient {
                id
                name
                address
            }
            contactPerson
            payerReference
            rows {
                id
                costPool {
                    id
                    name
                }
                description
                amount
            }
            total
        }
    }
`;

const Label = (props) => <Text display="block" fontSize="md" {...props} />;

const Cell = (props) => (
    <Box
        as="td"
        border="1px"
        borderColor="gray.400"
        px={2}
        fontSize="sm"
        {...props}
    />
);

const Invoice = ({ invoice }) => (
    <Box width="200mm" position="relative">
        <Heading as="h1" size="lg" mb={1}>
            {config.organization.name}
        </Heading>
        <Heading as="h1" size="md">
            Lasku #{invoice.runningNumber}
        </Heading>
        <Box as="table" width="100%" my={6}>
            <tbody>
                <tr>
                    <td>
                        <Text color="gray.600" mr={2}>
                            Päiväys
                        </Text>
                        <Text display="inline-block" pr={8}>
                            {formatDate(invoice.date)}
                        </Text>
                    </td>
                    <td>
                        <Text color="gray.600">Eräpäivä</Text>
                        <Text display="inline-block" pr={8}>
                            {formatDate(invoice.dueDate)}
                        </Text>
                    </td>
                    <td>
                        <Text color="gray.600" mr={2}>
                            Viitenumero
                        </Text>
                        <Text display="inline-block" pr={8}>
                            {referenceNumber(invoice.runningNumber)}
                        </Text>
                    </td>
                    <td>
                        <Text color="gray.600" mr={2}>
                            Viivästyskorko
                        </Text>
                        <Text display="inline-block" pr={8}>
                            {`${config.invoicing.interestPercentage} %`}
                        </Text>
                    </td>
                </tr>
            </tbody>
        </Box>
        <Flex>
            <Box width="50%">
                <Heading as="h2" size="md" mb={2}>
                    Lähettäjä
                </Heading>
                {config.organization.name}
                <Text whiteSpace="pre">{config.organization.address}</Text>
            </Box>
            <Box width="50%">
                <Heading as="h2" size="md" mb={2}>
                    Vastaanottaja
                </Heading>
                {invoice.recipient.name}
                <Text whiteSpace="pre">{invoice.recipient.address}</Text>
                <Flex mt={2}>
                    {invoice.contactPerson && (
                        <Box mr={4}>
                            <Text color="gray.600">Yhteyhenkilö</Text>
                            {invoice.contactPerson}
                        </Box>
                    )}
                    {invoice.payerReference && (
                        <Box>
                            <Text color="gray.600">Maksajan viite</Text>
                            {invoice.payerReference}
                        </Box>
                    )}
                </Flex>
            </Box>
        </Flex>
        <Box minHeight="sm">
            <Box as="table" width="100%" my={8}>
                <thead>
                    <tr>
                        <Box
                            as="th"
                            borderBottom="1px"
                            borderColor="gray.400"
                            py={1}
                            textAlign="left"
                        >
                            Nimike
                        </Box>
                        <Box
                            as="th"
                            borderBottom="1px"
                            borderColor="gray.400"
                            py={1}
                            textAlign="right"
                        >
                            Veroton hinta
                        </Box>
                        <Box
                            as="th"
                            borderBottom="1px"
                            borderColor="gray.400"
                            py={1}
                            textAlign="right"
                        >
                            Vero
                        </Box>
                        <Box
                            as="th"
                            borderBottom="1px"
                            borderColor="gray.400"
                            py={1}
                            textAlign="right"
                        >
                            Verollinen hinta
                        </Box>
                    </tr>
                </thead>
                <tbody>
                    {invoice.rows.map((row) => (
                        <tr key={row.id}>
                            <Box as="td" py={2} textAlign="left">
                                {row.description}
                            </Box>
                            <Box as="td" py={2} textAlign="right">
                                {formatCurrency(row.amount)}
                            </Box>
                            <Box as="td" py={2} textAlign="right">
                                0,0 %
                            </Box>
                            <Box as="td" py={2} textAlign="right">
                                {formatCurrency(row.amount)}
                            </Box>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <Box
                            as="td"
                            borderTop="1px"
                            borderColor="gray.400"
                            py={1}
                        ></Box>
                        <Box
                            as="td"
                            borderTop="1px"
                            borderColor="gray.400"
                            py={1}
                        ></Box>
                        <Box
                            as="th"
                            borderTop="1px"
                            borderColor="gray.400"
                            py={1}
                            textAlign="right"
                        >
                            Veroton yhteensä
                        </Box>
                        <Box
                            as="td"
                            borderTop="1px"
                            borderColor="gray.400"
                            py={1}
                            textAlign="right"
                        >
                            {formatCurrency(invoice.total)}
                        </Box>
                    </tr>
                    <tr>
                        <Box as="td" py={1}></Box>
                        <Box as="td" py={1}></Box>
                        <Box as="th" py={1} textAlign="right">
                            Vero
                        </Box>
                        <Box as="td" py={1} textAlign="right">
                            {formatCurrency(0)}
                        </Box>
                    </tr>
                    <tr>
                        <Box as="td"></Box>
                        <Box as="td"></Box>
                        <Box
                            as="th"
                            borderTop="2px"
                            borderColor="gray.500"
                            py={1}
                            textAlign="right"
                        >
                            Yhteensä
                        </Box>
                        <Box
                            as="th"
                            borderTop="2px"
                            borderColor="gray.500"
                            py={1}
                            fontSize="xl"
                            textAlign="right"
                        >
                            {formatCurrency(invoice.total)}
                        </Box>
                    </tr>
                </tfoot>
            </Box>
        </Box>
        <Text my={4} textAlign="center">
            {config.invoicing.note}
        </Text>
        <Box as="table" width="100%" height="xs">
            <tbody>
                <tr>
                    <Cell borderTopStyle="dashed">Saajan tilinumero</Cell>
                    <Cell borderTopStyle="dashed">
                        {config.invoicing.bankName}
                        <br />
                        {config.invoicing.IBAN}
                    </Cell>
                    <Cell borderTopStyle="dashed" colSpan={3}>
                        BIC
                        <br />
                        {config.invoicing.BIC}
                    </Cell>
                </tr>
                <tr>
                    <Cell>Saaja</Cell>
                    <Cell whiteSpace="pre">
                        {config.organization.name.toUpperCase()}
                        <br />
                        {config.organization.address.toUpperCase()}
                    </Cell>
                    <Cell colSpan={3} rowSpan={2}>
                        Käytättehän maksaessanne viitenumeroa.
                    </Cell>
                </tr>
                <tr>
                    <Cell rowSpan={2}>Maksaja</Cell>
                    <Cell rowSpan={2} whiteSpace="pre">
                        {invoice.recipient.name.toUpperCase()}
                        <br />
                        {invoice.recipient.address.toUpperCase()}
                    </Cell>
                </tr>
                <tr>
                    <Cell>Viitenumero</Cell>
                    <Cell colSpan={2}>
                        {referenceNumber(invoice.runningNumber)}
                    </Cell>
                </tr>
                <tr>
                    <Cell>Tililtä nro.</Cell>
                    <Cell></Cell>
                    <Cell>Eräpäivä</Cell>
                    <Cell>{formatDate(invoice.dueDate)}</Cell>
                    <Cell verticalAlign="top">
                        <Text mb={1} fontSize="xs">
                            Euro
                        </Text>
                        {invoice.total.toFixed(2).replace(".", ",")}
                    </Cell>
                </tr>
            </tbody>
        </Box>
    </Box>
);

const PrintSalesInvoice = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });

    return (
        <Box maxWidth="800px" margin="auto">
            {result.fetching ? (
                <Spinner color="indigo.500" display="block" />
            ) : null}
            <ErrorDisplay error={result.error} />
            {result.data ? (
                <Invoice invoice={result.data.salesInvoice} />
            ) : null}
        </Box>
    );
};

export default PrintSalesInvoice;
