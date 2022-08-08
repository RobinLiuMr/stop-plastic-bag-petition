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

// function to check login state
function checkLogin(request, response, next) {
    if (!request.session.userID) {
        console.log('not logged in!');
        response.redirect('/login');
        return;
    }
    console.log('logged in!');
    next();
}

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

// new user route
const routeUser = require('./routers/user');
const routeSignature = require('./routers/signature');
app.use(routeUser);
app.use(routeSignature);

// set PORT
const port = process.env.PORT || 1234;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
