const express = require('express');
const path = require('path');

// require needed db functions
const {} = require('./db');

const app = express();
// set up handlebars
const { engine } = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// serve static assets
app.use(express.static(path.join(__dirname, 'public')));
// parse html post form request body
app.use(express.urlencoded({ extended: false }));

// the landing page, with the form
app.get('/', (request, response) => {
    response.render('homepage', {
        title: 'Stop Crocs',
    });
});

// handles the form submission
app.post('/', (request, response) => {
    // console.log('POST /', request.body);
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
});

app.listen(8081, () => console.log(`Listening on http://localhost:8081`));
