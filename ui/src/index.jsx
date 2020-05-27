import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";

import App from "./App";
import theme from "./util/theme";
import schema from "./util/schema.json";
import { APIHost } from "./util/api";
import { enableMapSet } from "immer";
import { createClient, dedupExchange, Provider } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";
import { pipe, tap } from "wonka";
import { useMessage } from "./util/message";

enableMapSet();
const contactsQuery = `
    query {
        contacts {
            nodes {
                id
            }
        }
    }
`;

const GraphQLApp = () => {
    const [user, setUser] = useState();
    const { infoMessage } = useMessage();

    const logoutExchange = ({ forward }) => (ops$) =>
        pipe(
            ops$,
            forward,
            tap(({ error }) => {
                if (error && error.message.includes("not authenticated")) {
                    if (user) {
                        infoMessage("Ole hyvä ja kirjaudu sisään udelleen");
                    }
                    setUser(null);
                }
            })
        );

    const client = useMemo(
        () =>
            createClient({
                url: `${APIHost}/query`,
                exchanges: [
                    dedupExchange,
                    logoutExchange,
                    cacheExchange({
                        schema,
                        keys: {
                            User: ({ id }) => id || null,
                            SystemInfo: () => null,
                        },
                    }),
                    multipartFetchExchange,
                ],
                requestPolicy: "cache-and-network",
                fetchOptions: {
                    credentials: "include",
                },
            }),
        [user]
    );

    return (
        <Provider value={client}>
            <App user={user} setUser={setUser} />
        </Provider>
    );
};

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CSSReset />
        <GraphQLApp />
    </ThemeProvider>,
    document.querySelector("#root")
);
