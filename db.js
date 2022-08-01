// db.js
const spicedPg = require('spiced-pg');

const { DATABASE_USER, DATABASE_PASSWORD } = require('./secrets.json');
const DATABASE_NAME = 'petition';

// connection to the db
const db = spicedPg(
    `postgres:${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`
);

function createSignature({ first_name, last_name, signature }) {
    return db
        .query(
            `
            INSERT INTO signatures (first_name, last_name, signature)
            VALUES ($1, $2, $3)
            RETURNING *
        `,
            [first_name, last_name, signature]
        )
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db.query('SELECT * FROM signatures').then((result) => result.rows);
}

// CREATE TABLE signatures (
//     id SERIAL PRIMARY KEY,
//     first_name VARCHAR(255) NOT NULL,
//     last_name VARCHAR(255) NOT NULL,
//     signature TEXT NOT NULL CHECK (signature != '')
// );

function getSignatureById(id) {
    return db
        .query('SELECT * FROM signatures WHERE id = $1', [id])
        .then((result) => result.rows[0]);
}

module.exports = { createSignature, getSignatures, getSignatureById };
