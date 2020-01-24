const chance = new require('chance')();

const money = () => chance.integer({ min: 10, max: 2000 }) + 0.5;

const date = () => chance.date().toISOString().split('T')[0];

const invoiceRow = () => ({
    id: chance.hash(),
    costPool: chance.integer({ min: 1, max: 10 }),
    description: chance.sentence({ words: 5 }),
    createdAt: date(),
    modifiedAt: date(),
    amount: money(),
});

const attachments = [
    'https://indecs.fi/findecs/app/webroot/files/receipts/1579711437kiltaan%20tiskiharjat.jpg',
    'https://indecs.fi/findecs/app/webroot/files/receipts/1579606621Dokumentti%209_2.jpg',
    'https://indecs.fi/findecs/app/webroot/files/receipts/1578999818image.jpeg',
    'https://indecs.fi/findecs/app/webroot/files/receipts/1578942901Kuitti_Amazon.jpg',
    'https://indecs.fi/findecs/app/webroot/files/receipts/1579027139tokmanni%20vko2!.jpg',
];

const receipt = () => ({
    id: chance.hash(),
    amount: money(),
    user: chance.pick(['user1', 'user2', 'user3', 'admin']),
    attachment: chance.pick(attachments),
    createdAt: date(),
    modifiedAt: date(),
});

const costPools = new Array(10).fill(true).map((_, i) => ({
    id: i,
    name: chance.word(),
    budget: money(),
}));

module.exports = () => {
    const data = {
        costClaims: new Array(60).fill(true).map((_, i) => ({
            id: i,
            description: chance.sentence({ words: 5 }),
            details: chance.sentence({ words: 2 }),
            createdAt: date(),
            modifiedAt: date(),
            amount: money(),
            sourceOfMoney: chance.pick(['Oma tili', 'Muu tili', 'Käteinen']),
            status: chance.pick(['created', 'approved', 'paid', 'rejected']),
            statusReason: chance.sentence({ words: 5 }),
            author: chance.pick(['user1', 'user2', 'user3', 'admin']),
            costPool: costPools[chance.integer({ min: 0, max: 9 })].name,
            receipts: chance.n(receipt, 2),
        })),
        costPools: costPools,
        purchaseInvoices: new Array(20).fill(true).map((_, i) => ({
            id: i,
            sender: chance.pick(['firma1', 'firma2', 'firma3']),
            description: chance.sentence({ words: 2 }),
            details: chance.sentence({ words: 2 }),
            note: chance.sentence({ words: 2 }),
            createdAt: date(),
            modifiedAt: date(),
            dueDate: date(),
            status: chance.pick(['created', 'approved', 'paid', 'rejected']),
            rows: chance.n(invoiceRow, 5),
        })),
        salesInvoices: new Array(60).fill(true).map((_, i) => ({
            id: i,
            payer: chance.pick(['firma1', 'firma2', 'firma3']),
            contactPerson: chance.pick(['Henkilökunta 1', 'Henkilökunta 2', 'Henkilökunta 3']),
            reference: chance.hash(),
            createdAt: date(),
            dueDate: date(),
            amount: money(),
            status: chance.pick(['created', 'paid']),
            rows: chance.n(invoiceRow, 5),
        })),
    };

    return data;
};