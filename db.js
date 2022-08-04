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

// petition=# SELECT * FROM user_profiles;
//  id | user_id | age | city | homepage
// ----+---------+-----+------+----------
function createUserProfile({ user_id, age, city, homepage }) {
    return db
        .query(
            `
            INSERT INTO user_profiles (user_id, age, city, homepage)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
            [user_id, age, city, homepage]
        )
        .then((result) => result.rows[0]);
}

// petition=# SELECT * FROM users;
//  id | first_name | last_name | email | password_hash | created_at
// ----+------------+-----------+---------------+---------------+------------
function createUser({ first_name, last_name, email, password }) {
    return hash(password).then((password_hash) => {
        return db
            .query(
                `
            INSERT INTO users (first_name, last_name, email, password_hash)
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
        .query('SELECT * FROM users WHERE email = $1', [email])
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
    return db
        .query(
            `
            SELECT * FROM users
            JOIN signatures ON signatures.user_id = users.id
            FULL JOIN user_profiles ON user_profiles.user_id = users.id
            WHERE signatures.signature IS NOT NULL
            `
        )
        .then((result) => result.rows);
}

function getSignaturesByCity(city) {
    return db
        .query(
            `
            SELECT * FROM users
            JOIN signatures ON signatures.user_id = users.id
            FULL JOIN user_profiles ON user_profiles.user_id = users.id
            WHERE signatures.signature IS NOT NULL
            AND user_profiles.city ILIKE $1
        `,
            [city]
        )
        .then((result) => result.rows);
}

// petition=# SELECT * FROM signatures;
//  id | user_id | signature
// ----+---------+-----------
function getSignatureByUserId(user_id) {
    return db
        .query('SELECT * FROM signatures WHERE user_id = $1', [user_id])
        .then((result) => result.rows[0]);
}

function getUserInfo(user_id) {
    return db
        .query(
            `
            SELECT users.first_name, users.last_name, users.email, user_profiles.*
            FROM users
            FULL JOIN user_profiles 
            ON user_profiles.user_id = users.id
            WHERE user_id = $1
        
        `,
            [user_id]
        )
        .then((result) => result.rows[0]);
}

function updateUser({ first_name, last_name, email, user_id }) {
    return db
        .query(
            `
            UPDATE users
            SET first_name = $1, last_name = $2, email = $3
            WHERE users.id = $4
            RETURNING *
            
            `,
            [first_name, last_name, email, user_id]
        )
        .then((result) => result.rows[0]);
}

function upsertUserProfile({ user_id, age, city, homepage }) {
    return db
        .query(
            `
        INSERT INTO user_profiles (user_id, age, city, homepage)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id)
DO UPDATE SET age = $2, city = $3, homepage = $4
    
    `,
            [user_id, age, city, homepage]
        )
        .then((result) => result.rows[0]);
}

// delete signature
function deleteSignature(user_id) {
    return db
        .query(
            `
       DELETE FROM signatures
WHERE user_id = $1 
    `,
            [user_id]
        )
        .then((result) => result.rows[0]);
}

// exports------------------------------------
module.exports = {
    createSignature,
    getSignatures,
    getSignatureByUserId,
    createUser,
    login,
    createUserProfile,
    getSignaturesByCity,
    getUserInfo,
    updateUser,
    upsertUserProfile,
    deleteSignature,
};
