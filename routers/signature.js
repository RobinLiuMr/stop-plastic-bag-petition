const express = require('express');
const router = express.Router();

// import db.js function
const {
    createSignature,
    getSignatures,
    getSignatureByUserId,
    getSignaturesByCity,
    deleteSignature,
} = require('../db');

// import middleware

const { checkLogin, checkSignature } = require('./middleware');

// homepage: signature submission
router.post('/', checkLogin, (request, response) => {
    if (!request.body.signature) {
        response.render('homepage', {
            title: 'Stop Plastic Bag',
            name: 'homepage',
            error: `Please draw your signature!`,
        });
        return;
    }

    createSignature({
        user_id: request.session.userID,
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

router.get('/', checkLogin, (request, response) => {
    if (request.session.signatureID) {
        // console.log(request.session.signatureID);
        response.redirect('/thank-you');
        return;
    }

    response.render('homepage', {
        title: 'Stop Plastic Bag',
        name: 'homepage',
    });
});

// thank you page: when a signature is successfully submitted.
router.get('/thank-you', checkLogin, checkSignature, (request, response) => {
    getSignatureByUserId(request.session.userID).then((foundSignature) => {
        response.render('thank-you', {
            title: 'Thank You',
            name: 'thank-you',
            foundSignature,
        });
    });
});

// signatures page
router.get('/signatures', checkLogin, checkSignature, (request, response) => {
    getSignatures().then((signatures) => {
        response.render('signatures', {
            title: 'Signatures',
            name: 'signatures',
            signatures,
        });
    });
});

// signatures by city page
router.get(
    '/signatures/:city',
    checkLogin,
    checkSignature,
    (request, response) => {
        getSignaturesByCity(request.params.city).then((signatures) => {
            response.render('signaturesByCity', {
                title: 'Signatures By City',
                name: 'city',
                city: request.params.city,
                signatures,
            });
        });
    }
);

// delete signature
router.post('/unsign', (request, response) => {
    deleteSignature(request.session.userID)
        .then(() => {
            request.session.signatureID = null;
            response.redirect('/');
        })

        .catch((error) => {
            console.log('delete signature', error);
        });
});

// export the router
module.exports = router;
