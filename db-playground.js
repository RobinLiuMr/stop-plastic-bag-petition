// db-playground.js
const { createUser, createUserProfile } = require('./db.js');

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

createUserProfile({
    user_id: 1,
    age: 99,
    city: 'Berlin',
    homepage: 'www.yo.com',
})
    .then((newUser) => {
        console.log('newUser', newUser);
    })
    .catch((error) => {
        console.log('error creating user', error);
    });
