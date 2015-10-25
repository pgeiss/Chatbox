$(document).ready(function () {
    const buttonSelector = '.btn';
    const loginButtonSelector = '.signInBtn';
    const registerButtonSelector = '.registerBtn';
    $(buttonSelector).fadeTo('fast', .75);
    $(loginButtonSelector).mouseenter(function () {
        $(loginButtonSelector).fadeTo('fast', 1)
    });
    $(loginButtonSelector).mouseleave(function () {
        $(loginButtonSelector).fadeTo('fast', .75)
    });
    $(registerButtonSelector).mouseenter(function () {
        $(registerButtonSelector).fadeTo('fast', 1)
    });
    $(registerButtonSelector).mouseleave(function () {
        $(registerButtonSelector).fadeTo('fast', .75)
    });
});