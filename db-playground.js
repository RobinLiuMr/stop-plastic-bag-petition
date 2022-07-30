const { getCities, getCityByName, createCity } = require('./db');

// getCities().then((cities) => console.log(cities));

// getCityByName('Berlin').then((city) => {
//     console.log(city);
// });

createCity({
    name: 'Frankfurt',
    country: 'Germany',
    population: 500000,
}).then((newCity) => console.log(newCity));
