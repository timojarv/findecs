const fs = require('fs');
const fetch = require('node-fetch');
const getIntrospectionQuery = require('graphql').getIntrospectionQuery;

fetch('http://localhost:8080/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        variables: {},
        query: getIntrospectionQuery({ descriptions: false }),
    }),
})
    .then((result) => result.json())
    .then(({ data }) => {
        fs.writeFile('./schema.json', JSON.stringify(data), (err) => {
            if (err) {
                console.error('Writing failed:', err);
                return;
            }
            console.log('Schema written!');
        });
    });
