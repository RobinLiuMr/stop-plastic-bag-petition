// db-playground.js
const { createUser, login } = require('./db.js');

// createUser({
//     first_name: 'yo',
//     last_name: 'yo',
//     email: 'yo@yo.com',
//     password: 'yo',
// })
//     .then((newUser) => {
//         console.log('newUser', newUser);
//     })
//     .catch((error) => {
//         console.log('error creating user', error);
//     });

login({
    email: 'yo@yo.com',
    password: 'yoo',
}).then((foundUser) => {
    console.log('foundUser', foundUser);
});
