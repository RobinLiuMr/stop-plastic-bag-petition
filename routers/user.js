const express = require('express');
const router = express.Router();

// import db.js function
const {
    createUser,
    login,
    createUserProfile,
    getUserInfo,
    updateUser,
    upsertUserProfile,
} = require('../db');

// import middleware

const { checkLogin } = require('./middleware');

// the register page - mandatory information
router.get('/register', (request, response) => {
    if (request.session.userID) {
        response.redirect('/thank-you');
        return;
    }

    response.render('register', {
        title: 'Stop Corona',
    });
});

router.post('/register', (request, response) => {
    if (
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.email ||
        !request.body.password
    ) {
        response.render('register', {
            title: 'Stop Corona',
            error: `Please fill all fields!`,
        });
        return;
    }

    createUser(request.body)
        .then((newUser) => {
            request.session.userID = newUser.id;
            response.redirect('/profile');
        })
        .catch((error) => {
            console.log('create user', error);
            response.status(500).render('register', {
                title: 'Stop Corona',
                error: `New user was not created!`,
            });
        });
});

// the profile page - optional information
router.post('/profile', checkLogin, (request, response) => {
    createUserProfile({
        user_id: request.session.userID,
        ...request.body,
    })
        .then(response.redirect('/'))
        .catch(() => {
            console.log('empty user profile');
        });
});

router.get('/profile', checkLogin, (request, response) => {
    response.render('profile', {
        title: 'profile',
    });
});

// login page
router.post('/login', (request, response) => {
    if (!request.body.email || !request.body.password) {
        response.render('login', {
            title: 'Stop Corona',
            error: `Please fill all fields!`,
        });
        return;
    }

    login(request.body)
        .then((foundUser) => {
            request.session.userID = foundUser.id;
            request.session.signatureID = foundUser.id;
            response.redirect('/thank-you');
        })
        .catch((error) => {
            console.log('login user', error);
            response.status(500).render('login', {
                title: 'Stop Corona',
                error: `No user was not found!`,
            });
        });
});

router.get('/login', (request, response) => {
    if (request.session.userID) {
        response.redirect('/thank-you');
        return;
    }

    response.render('login', {
        title: 'Stop Corona',
    });
});

// edit profile -- editProfile.handlebars
router.get('/profile/edit', checkLogin, (request, response) => {
    getUserInfo(request.session.userID).then((userInfo) => {
        response.render('editProfile', {
            title: 'Edit Profile',
            ...userInfo,
        });
    });
});

router.post('/profile/edit', checkLogin, (request, response) => {
    const update_user = updateUser({
        ...request.body,
        user_id: request.session.userID,
    });

    const update_profile = upsertUserProfile({
        user_id: request.session.userID,
        ...request.body,
    });

    Promise.all([update_user, update_profile])
        .then(response.redirect('/'))
        .catch((error) => {
            console.log('edit profile error', error);
        });
});

// log out

router.post('/logout', (request, response) => {
    request.session = null;
    response.redirect('/login');
});

// export the router
module.exports = router;
