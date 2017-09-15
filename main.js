var webdriverio = require('webdriverio');

var SETTINGS = require('./settings.json');

var SCRIPTS = [
    { path: './scripts/sign-in.js',    timeout: 10000 },
    { path: './scripts/order-food.js', timeout: 120000 }
];

var client = webdriverio.remote({
    desiredCapabilities: {
        browserName: 'google-chrome'
    }
});

var browser = client
    .init()
    .url(SETTINGS.url)
;

SCRIPTS.forEach(function (script) {
    console.log('INJECT "' + script.path + '"');

    var source = require(script.path);
    browser = browser
        .execute(source, SETTINGS)
        .pause(script.timeout)
    ;
});

browser
    .end()
        .catch(function (error) {
            console.error(error.stack);
            return client.end();
        })
;
