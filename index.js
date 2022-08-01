const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');

// require needed db functions
const { createSignature, getSignatures, getSignatureById } = require('./db');

const app = express();
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

// handles the form submission
app.post('/', (request, response) => {
    console.log('POST /', request.body);
    if (
        !request.body.first_name ||
        !request.body.last_name ||
        !request.body.signature
    ) {
        response.render('homepage', {
            title: 'Stop Crocs',
            error: `Please fill all fields!`,
        });
        return;
    }

    createSignature(request.body)
        .then((newSignature) => {
            request.session.signatureID = newSignature.id;
            response.redirect('/thank-you');
        })
        .catch((error) => {
            console.log('POST signature', error);
            response.redirect('/');
        });
});

// the landing page, with the form
app.get('/', (request, response) => {
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
    if (!request.session.signatureID) {
        response.redirect('/');
        return;
    }

    getSignatureById(request.session.signatureID).then((signedUser) => {
        response.render('thank-you', {
            title: 'Thank You',
            signedUser,
        });
    });
});

// signatures page
app.get('/signatures', (request, response) => {
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

app.listen(8081, () => console.log(`Listening on http://localhost:8081`));
