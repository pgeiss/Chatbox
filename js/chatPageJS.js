var socket = io.connect('//test.petergeiss.me:3000');

socket.on('incoming message', function (msg) {
    addNewMessage(msg, false);
});

var inputSelector = '#msg';
var liSelector = '.list-group';
$('form').submit(function (e) {
    var enteredMessage = $(inputSelector).val();
    e.preventDefault();
    socket.emit('msg', enteredMessage);
    addNewMessage(enteredMessage, true);
    $(inputSelector).val('');
    return false;
});

function addNewMessage(msg, isUser) {
    var liClass = '';
    if (isUser)
        liClass = 'user-message';
    else liClass = 'other-message';
    $(document).ready(function () {
        $(liSelector).append('\<li class=\"list-group-item ' + liClass + '\"\>' + msg + '\</li\>');
    });
}