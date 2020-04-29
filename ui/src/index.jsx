import React from "react";
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

enableMapSet();

const client = createClient({
    url: `${APIHost}/query`,
    exchanges: [
        dedupExchange,
        cacheExchange({
            schema,
            keys: {
                User: ({ id }) => id || null,
            },
        }),
        multipartFetchExchange,
    ],
    requestPolicy: "cache-and-network",
});

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CSSReset />
        <Provider value={client}>
            <App />
        </Provider>
    </ThemeProvider>,
    document.querySelector("#root")
);
