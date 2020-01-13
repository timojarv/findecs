const chance = new require('chance')();

module.exports = () => {
    const data = {
        claims: new Array(60).fill(true).map((_, i) => ({
            id: chance.hash({ length: 15 }),
            description: chance.sentence({ words: 5 }),
            createdAt: chance.date().toISOString().split('T')[0],
            amount: chance.integer({ min: 10, max: 2000 }) + 0.5,
            sourceOfMoney: chance.pick(['Oma tili', 'Muu tili', 'Käteinen']),
            status: chance.pick(['created', 'approved', 'paid']),
            author: chance.pick(['user1', 'user2', 'user3', 'admin'])
        }))
    };

    return data;
};