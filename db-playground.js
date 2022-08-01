const { getSignatureById } = require('./db');

// getCities().then((cities) => console.log(cities));

// getCityByName('Berlin').then((city) => {
//     console.log(city);
// });

getSignatureById('4').then((x) => {
    console.log(x);
});

// createSignature({
//     first_name: 'Ro',
//     last_name: 'u',
//     signature: 'L',
// }).then((newSignature) => console.log(newSignature));

// getSignatures().then((signatures) => console.log(signatures));
