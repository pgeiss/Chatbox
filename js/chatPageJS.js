var socket = io.connect('//app.petergeiss.me:39000');
//var socket = io.connect('//localhost:39000'); // DEBUG USE ONLY

socket.on('incoming message', function (msg) {
    addNewMessage(msg, false);
});

function SentGlobalMessage(msg, sender) {
    this.msg = msg;
    this.sender = sender;
}

var inputSelector = '#msg';
var liSelector = '.list-group';
$('form').submit(function (e) {
    var enteredMessage = new SentGlobalMessage($(inputSelector).val(), '');
    e.preventDefault();
    socket.emit('msg', enteredMessage);
    addOwnMessage(enteredMessage);
    $(inputSelector).val('');
    return false;
});

function addOwnMessage(Msg) {
    var toSend = Msg;
    toSend.msgType = 'own';
    addNewMessage(toSend);
}

function addNewMessage(Msg) {
    var liClass = '';
    var startCol = '\<div class="row"\>';
    var endCol = '\</div\>';
    if (Msg.msgType === 'own') {
        liClass = 'user-message';
        startCol = startCol + '\<div class="col-xs-3 col-lg-7"\>\</div\>';
        endCol = '\<div class="col-xs-1 col-lg-1"\>\</div\>' + endCol;
        
    }
    else if (Msg.msgType === 'other') { 
        liClass = 'other-message';
        startCol = startCol + '\<div class="col-xs-1 col-lg-1"\>\</div\>';
        endCol = '\<div class="col-xs-3 col-lg-7"\>\</div\>' + endCol;
    } else {
        throw 'Undefined message type received!';
    }

    $(document).ready(function () {
            $(liSelector).append(startCol + 
                '\<div class="col-xs-8 col-lg-4"\>' + 
                '\<li class=\"list-group-item ' + 
                liClass + '\"\>' + Msg.msg + '\</li\>\</div\>' + endCol);
        });  
}