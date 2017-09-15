module.exports = function (SETTINGS) {
    // Fill out the form
    $('#email').val(SETTINGS.username);
    $('#next-login0').click();

    setTimeout(function () {
        $('#password').val(SETTINGS.password);
        $('.login-button').click();
    }, SETTINGS.delay);
};