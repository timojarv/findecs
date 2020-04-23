import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';

import App from './App';
import theme from './util/theme';
import schema from './util/schema.json';
import { enableMapSet } from 'immer';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';

enableMapSet();

const client = createClient({
    url: 'http://localhost:8080/query',
    exchanges: [
        dedupExchange,
        cacheExchange({
            schema,
        }),
        fetchExchange,
    ],
    requestPolicy: 'cache-and-network',
});

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CSSReset />
        <Provider value={client}>
            <App />
        </Provider>
    </ThemeProvider>,
    document.querySelector('#root')
);
