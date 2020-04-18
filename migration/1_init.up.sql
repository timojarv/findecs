create table users (
    id varchar(64) primary key,
    name varchar(255) not null,
    email varchar(255) not null,
    signature varchar(64),
    pw_hash varchar(64) not null
);

create table cost_claims (
    id varchar(64) primary key,
    running_number int not null,
    description text,
    user varchar(64) not null,
    cost_pool varchar(64) not null,
    status varchar(64) not null,
    status_reason text,
    source_of_money varchar(64) not null,
    created datetime default current_timestamp,
    modified datetime,
    accepted_by varchar(64),
    foreign key (user) references users(id)
);