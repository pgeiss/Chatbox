var socket = io.connect('//app.petergeiss.me:39000');
//var socket = io.connect('//localhost:39000'); // DEBUG USE ONLY

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
    var startCol = '\<div class="row"\>';
    var endCol = '\</div\>';
    if (isUser) {
        liClass = 'user-message';
        startCol = startCol + '\<div class="col-xs-7"\>\</div\>';
        endCol = '\<div class="col-xs-1"\>\</div\>' + endCol;
        
    }
    else { 
        liClass = 'other-message';
        startCol = startCol + '\<div class="col-xs-1"\>\</div\>';
        encCol = '\<div class="col-xs-7"\>\</div\>' + endCol;
    }

    $(document).ready(function () {
            $(liSelector).append(startCol + 
                '\<div class="col-xs-4"\>\<li class=\"list-group-item ' + 
                liClass + '\"\>' + msg + '\</li\>\</div\>' + endCol);
        });  
}