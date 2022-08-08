const { getSignatureByUserId } = require('../db');

// functions of check
function checkLogin(request, response, next) {
    if (!request.session.userID) {
        console.log('not logged in!');
        response.redirect('/login');
        return;
    }
    console.log('logged in!');
    next();
}

function checkSignature(request, response, next) {
    getSignatureByUserId(request.session.userID).then((signature) => {
        if (!signature) {
            console.log('no signature');
            response.redirect('/');
            return;
        }
        console.log('signature is available.');
        next();
    });
}

module.exports = { checkLogin, checkSignature };
