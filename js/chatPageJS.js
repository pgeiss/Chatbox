var socket = io.connect('http://localhost:3000');
var inputSelector = '#msg';
$('form').submit(function () {
    socket.emit('msg', $(inputSelector).val());
    console.log($('#msg').val());
    $(inputSelector).val('');
    return false;
});