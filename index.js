const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const helmet = require('helmet');

// require needed db functions
const {
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
} = require('./db');

const app = express();
app.use(helmet()); // prevent vulnerabilities
// set up handlebars
const { engine } = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// set up cookies
const { SESSION_SECRET } = require('./secrets.json');

app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14, // two weeks of cookie validity
    })
);

// serve static assets
app.use(express.static(path.join(__dirname, 'public')));
// parse html post form request body
app.use(express.urlencoded({ extended: false }));

// the profile page
app.post('/profile', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    createUserProfile({
        user_id: request.session.user_id,
        ...request.body,
    })
        .then(response.redirect('/'))
        .catch(() => {
            console.log('empty user profile');
        });
});

app.get('/profile', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    response.render('profile', {
        title: 'profile',
    });
});

// edit profile -- editProfile.handlebars
app.get('/profile/edit', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    getUserInfo(request.session.user_id).then((userInfo) => {
        response.render('editProfile', {
            title: 'Edit Profile',
            ...userInfo,
        });
    });
});

app.post('/profile/edit', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    const update_user = updateUser({
        ...request.body,
        ...request.session,
    });

    const update_profile = upsertUserProfile({
        ...request.session,
        ...request.body,
    });

    Promise.all([update_user, update_profile])
        .then(response.redirect('/'))
        .catch((error) => {
            console.log('edit profile error', error);
        });
});

// the register page
app.post('/register', (request, response) => {
    if (
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.email ||
        !request.body.password
    ) {
        response.render('register', {
            title: 'Stop Crocs',
            error: `Please fill all fields!`,
        });
        return;
    }

    createUser(request.body)
        .then((newUser) => {
            request.session.user_id = newUser.id;
            response.redirect('/profile');
        })
        .catch((error) => {
            console.log('create user', error);
            response.status(500).render('register', {
                title: 'Stop Crocs',
                error: `New user was not created!`,
            });
        });
});

app.get('/register', (request, response) => {
    if (request.session.user_id) {
        response.redirect('/thank-you');
        return;
    }

    response.render('register', {
        title: 'Stop Crocs',
    });
});

// login page
app.post('/login', (request, response) => {
    if (!request.body.email || !request.body.password) {
        response.render('login', {
            title: 'Stop Crocs',
            error: `Please fill all fields!`,
        });
        return;
    }

    login(request.body)
        .then((foundUser) => {
            request.session.user_id = foundUser.id;
            request.session.signatureID = foundUser.id;
            response.redirect('/thank-you');
        })
        .catch((error) => {
            console.log('login user', error);
            response.status(500).render('login', {
                title: 'Stop Crocs',
                error: `No user was not found!`,
            });
        });
});

app.get('/login', (request, response) => {
    if (request.session.user_id) {
        response.redirect('/thank-you');
        return;
    }

    response.render('login', {
        title: 'Stop Crocs',
    });
});

// signature submission page
app.post('/', (request, response) => {
    // console.log('POST /', request.body);
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    if (!request.body.signature) {
        response.render('homepage', {
            title: 'Stop Crocs',
            error: `Please draw your signature!`,
        });
        return;
    }

    createSignature({
        user_id: request.session.user_id,
        signature: request.body.signature,
    })
        .then((newSignature) => {
            request.session.signatureID = newSignature.id;
            response.redirect('/thank-you');
        })
        .catch((error) => {
            console.log('POST signature', error);
            response.redirect('/');
        });
});

app.get('/', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/register');
        return;
    }

    if (request.session.signatureID) {
        response.redirect('/thank-you');
        return;
    }

    response.render('homepage', {
        title: 'Stop Crocs',
    });
});

// the thank you page
app.get('/thank-you', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    if (!request.session.signatureID) {
        response.redirect('/');
        return;
    }

    getSignatureByUserId(request.session.user_id).then((foundSignature) => {
        response.render('thank-you', {
            title: 'Thank You',
            foundSignature,
        });
    });
});

// signatures page
app.get('/signatures', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    if (!request.session.signatureID) {
        response.redirect('/');
        return;
    }

    getSignatures().then((signatures) => {
        response.render('signatures', {
            title: 'Signatures',
            signatures,
        });
    });
});

// signatures by city page
app.get('/signatures/:city', (request, response) => {
    if (!request.session.user_id) {
        response.redirect('/login');
        return;
    }

    if (!request.session.signatureID) {
        response.redirect('/');
        return;
    }

    getSignaturesByCity(request.params.city).then((signatures) => {
        response.render('signaturesByCity', {
            title: 'Signatures By City',
            city: request.params.city,
            signatures,
        });
    });
});

// log out
app.post('/logout', (request, response) => {
    request.session = null;
    response.redirect('/login');
});

// delete signature
app.post('/unsign', (request, response) => {
    deleteSignature(request.session.user_id)
        .then(() => {
            request.session.signatureID = null;
            response.redirect('/');
        })

        .catch((error) => {
            console.log('delete signature', error);
        });
});

app.listen(8081, () => console.log(`Listening on http://localhost:8081`));
