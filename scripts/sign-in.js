module.exports = function (SETTINGS, DONE) {
    // Fill out the form
    $('#email').val(SETTINGS.username);
    $('#next-login0').click();

    _setTimeout(function () {
        $('#password').val(SETTINGS.password);
        $('.login-button').click();

        DONE('Successfully logged in');
    }, SETTINGS.delay);
};