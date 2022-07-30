// db.js
const spicedPg = require('spiced-pg');

const { DATABASE_USER, DATABASE_PASSWORD } = require('./secrets.json');
const DATABASE_NAME = 'geography';

// connection to the db
const db = spicedPg(
    `postgres:${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`
);

function getCities() {
    return db.query('SELECT * FROM cities').then((result) => result.rows);
}

function getCityByName(name) {
    return db
        .query('SELECT * FROM cities WHERE name = $1', [name])
        .then((result) => result.rows[0]);
}

function createCity({ name, country, population }) {
    return db
        .query(
            `
            INSERT INTO cities (name, country, population)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
            [name, country, population]
        )
        .then((result) => result.rows[0]);
}

module.exports = { getCities, getCityByName, createCity };
