// db.js
const spicedPg = require('spiced-pg');
const bcrypt = require('bcryptjs');

const { DATABASE_USER, DATABASE_PASSWORD } = require('./secrets.json');
const DATABASE_NAME = 'petition';

// connection to the db
const db = spicedPg(
    `postgres:${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`
);

const hash = (password) =>
    bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));

// petition=# SELECT * FROM users;
//  id | first_name | last_name | email_address | password_hash | created_at
// ----+------------+-----------+---------------+---------------+------------
function createUser({ first_name, last_name, email, password }) {
    return hash(password).then((password_hash) => {
        return db
            .query(
                `
            INSERT INTO users (first_name, last_name, email_address, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
                [first_name, last_name, email, password_hash]
            )
            .then((result) => result.rows[0]);
    });
}

function getUserByEmail(email) {
    return db
        .query('SELECT * FROM users WHERE email_address = $1', [email])
        .then((result) => result.rows[0]);
}

function login({ email, password }) {
    return getUserByEmail(email).then((foundUser) => {
        if (!foundUser) {
            return null; // no email found
        }

        return bcrypt
            .compare(password, foundUser.password_hash)
            .then((match) => {
                if (!match) {
                    return null; // no password match the email
                }
                return foundUser;
            });
    });
}

// petition=# SELECT * FROM signatures;
//  id | user_id | signature
// ----+---------+-----------
function createSignature({ user_id, signature }) {
    return db
        .query(
            `
            INSERT INTO signatures (user_id, signature)
            VALUES ($1, $2)
            RETURNING *
        `,
            [user_id, signature]
        )
        .then((result) => result.rows[0]);
}

function getSignatures() {
    return db.query('SELECT * FROM signatures').then((result) => result.rows);
}

// function getSignatureById(id) {
//     return db
//         .query('SELECT * FROM signatures WHERE id = $1', [id])
//         .then((result) => result.rows[0]);
// }

// petition=# SELECT * FROM signatures;
//  id | user_id | signature
// ----+---------+-----------
function getSignatureByUserId(user_id) {
    return db
        .query('SELECT * FROM signatures WHERE user_id = $1', [user_id])
        .then((result) => result.rows[0]);
}

module.exports = {
    createSignature,
    getSignatures,
    getSignatureByUserId,
    createUser,
    login,
};
