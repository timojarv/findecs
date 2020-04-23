export const statuses = {
    created: 'Luotu',
    approved: 'Hyväksytty',
    paid: 'Maksettu',
    rejected: 'Hylätty',
};

export const statusColors = {
    created: 'orange',
    approved: 'green',
    paid: 'indigo',
    rejected: 'red',
};

export const sourcesOfMoney = {
    ownAccount: 'Oma tili',
    otherAccount: 'Muu tili',
    cash: 'Rahat kassasta',
};

export const roles = {
    basic: {
        color: 'gray',
        label: 'Peruskäyttäjä',
    },
    admin: {
        color: 'teal',
        label: 'Ylläpitäjä',
    },
    root: {
        color: 'grape',
        label: 'Super',
    },
};
