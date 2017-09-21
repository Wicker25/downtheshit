const webdriver    = require('selenium-webdriver');
const chromeDriver = require('selenium-webdriver/chrome');

const fs = require('fs');

const SETTINGS = require('./config/settings.json');

const SCRIPTS = [
    { path: './scripts/sign-in.js',    timeout: 10000 },
    { path: './scripts/order-food.js', timeout: 120000 }
];

/**
 * Executes the JavaScript source in the browser context.
 *
 * @param {string}   source   The JavaScript source.
 * @param {Object}   SETTINGS The settings.
 * @param {Function} DONE     The callback for returning a value to the script context.
 */
function scriptRunner(source, SETTINGS, DONE) {
    function sendResult(value) {
        DONE({ value: value })
    }

    function exceptionHandler(f) {
        return function () {
            try {
                f.apply(null, arguments);
            } catch (e) {
                DONE({
                    error: e.message,
                    stack: e.stack
                });
            }
        };
    }

    // Wrap asynchronous functions
    window._setTimeout = function (f) {
        arguments[0] = exceptionHandler(f);
        return window.setTimeout.apply(this, arguments);
    };

    window._setInterval = function (f) {
        arguments[0] = exceptionHandler(f);
        return window.setInterval.apply(this, arguments);
    };

    // Run the script
    var runner = exceptionHandler(
        new Function('return ' + source)()
    );

    runner(SETTINGS, sendResult);
}

/**
 * Parses the result of the JavaScript executed in the browser context.
 *
 * @param {Object} result The result to parse.
 */
function parseResult(result) {
    if (typeof result.error !== 'undefined') {
        console.log(
            'ERROR "' + result.error + '"\n\n' +
            result.stack.replace(/^/mg, '>>> ')
        );
    } else if (typeof result.value !== 'undefined') {
        console.log('RESULT "' + result.value + '"');
    }

    // Save a screenshot
    driver.takeScreenshot().then(function (data) {
        fs.writeFileSync('logs/screenshot.png', data, 'base64');
    });
}

/**
 * RUN THE SCRIPTS
 */
let options = new chromeDriver.Options();
options.addArguments(
    'headless',
    'disable-gpu',
    'window-size=1024,768'
);

let driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
;

driver.get(SETTINGS.url);

SCRIPTS.forEach(function (script) {
    console.log('INJECT "' + script.path + '"');

    var source = require(script.path);

    driver.manage()
        .setTimeouts({ script: script.timeout })
    ;

    driver.executeAsyncScript(scriptRunner, source, SETTINGS)
        .then(parseResult)
    ;
});

driver.quit();