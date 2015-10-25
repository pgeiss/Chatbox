var socket = io.connect('//app.petergeiss.com:39000');
//var socket = io.connect('//localhost:39000'); // DEBUG USE ONLY
var cookieArray = document.cookie.split('; ');
var displayName = '';
for (var i = 0; i < cookieArray.length; i++) {
    if (cookieArray[i].indexOf('dispName=') === 0) {
        displayName = cookieArray[i].substring('dispName='.length, 
            cookieArray[i].length);
        break;
    }
}

socket.on('incoming global message', function (Msg) {
    addNewMessage(Msg);
});

socket.on('incoming private message', function (Msg) {
    addNewMessage(Msg);
})
socket.on('incoming notice', function (Msg) {
    addNewMessage(Msg);
})

socket.on('dnCheck', function () {
    socket.emit('dnCheckReturn', displayName);
});

socket.on('anonDn', function (dn) {
    displayName = dn;
})

function SentMessage(msg, sender) {
    this.msg = msg;
    this.sender = sender;
}

function PrivateMessage(msg, sender, target) {
    this.msg = msg;
    this.sender = sender;
    this.target= target;
}

function Notice(msg, sender) {
    this.msg = msg;
    if (sender === undefined) {
        this.sender = 'Notice';
    } else {
        this.sender = sender;
    }
}

var inputSelector = '#msg';
var liSelector = '.list-group';
$('form').submit(function (e) {
    //var enteredMessage = new SentMessage($(inputSelector).val(), 
      //  displayName);
    var enteredMessage = $(inputSelector).val();
    e.preventDefault();

    if (enteredMessage.length !== 0) {

        if (enteredMessage.search(/^\/.*$/) !== -1) {
            if (enteredMessage.search(/^\/w \S+ .+$/i) !== -1) {
                var matched = enteredMessage.match(/^\/w (\S+) (.+)$/i);
                var target = matched[1];
                var message = matched[2];
                var Msg = new PrivateMessage(message, displayName, target);

                socket.emit('private message', Msg);
                addOwnPrivateMessage(Msg);
            } 

            else if (enteredMessage.search(/^\/n .+$/i) !== -1) {
                console.log(enteredMessage);
                var message = enteredMessage.match(/^\/n (.+)$/i);
                socket.emit('notice', new Notice(message[1]));
            } 

            else if (enteredMessage.search(/^\/notice \S+ .*$/) !== -1) {
                var matched = 
                    enteredMessage.match(/^\/notice (\S+) (.*)/);
                var sender = matched[1];
                var message = matched[2];
                socket.emit('notice', new Notice(message, sender));
            }

             else {
                addInfo('The command you entered wasn\'t recognized.');
            }
        } else {
            var Msg = new SentMessage(enteredMessage, displayName);
            socket.emit('global message', Msg);
            addOwnMessage(Msg);
        }
    }
    
    $(inputSelector).val('');
    return false;
});

function scrollDown() {
    $('html, body').animate({
        scrollTop: $(document).height()
    }, 100);
}

function addOwnMessage(Msg) {
    var toSend = Msg;
    toSend.msgType = 'own';
    addNewMessage(toSend);
}

function addOwnPrivateMessage(Msg) {
    var toSend = Msg;
    toSend.msgType = 'own private';
    addNewMessage(toSend);
}

function addInfo(info) {
    var toSend = {msg: info, msgType: 'notice', sender: 'Command'};
    addNewMessage(toSend);
}

function addNewMessage(Msg) {
    var liClass = '';
    var startCol = '\<div class="row"\>';
    var endCol = '\</div\>';

    switch(Msg.msgType) {

        case 'own':
            liClass = 'user-message';
            startCol = startCol + 
                '\<div class="col-xs-3 col-lg-6"\>\</div\>';
            endCol = '\<div class="col-xs-1 col-lg-1"\>\</div\>' + endCol;
            break;

        case 'own private':
            liClass = 'private-message';
            startCol = startCol + 
                '\<div class="col-xs-3 col-lg-6"\>\</div\>';
            endCol = '\<div class="col-xs-1 col-lg-1"\>\</div\>' + endCol;
            break;

        case 'other':
            liClass = 'other-message';
            startCol = startCol + 
                '\<div class="col-xs-1 col-lg-1"\>\</div\>';
            endCol = '\<div class="col-xs-3 col-lg-6"\>\</div\>' + endCol;
            break;

        case 'other private':
            liClass = 'private-message';
            startCol = startCol + 
                '\<div class="col-xs-1 col-lg-1"\>\</div\>';
            endCol = '\<div class="col-xs-3 col-lg-6"\>\</div\>' + endCol;
            break;

        case 'admin':
            liClass = 'admin-message';
            startCol = startCol + 
                '\<div class="col-xs-1 col-lg-1"\>\</div\>';
            endCol = '\<div class="col-xs-3 col-lg-6"\>\</div\>' + endCol;
            break;

        case 'notice':
            liClass = 'notice-message';
            startCol = startCol + 
                '\<div class="col-xs-1 col-lg-1"\>\</div\>';
            endCol = '\<div class="col-xs-1 col-lg-1"\>\</div\>' + endCol;
            break;

        default:
            throw 'Undefined message type received!';
    }
    if (Msg.msgType === 'own private' || Msg.msgType === 'other private') {
        $(liSelector).append(startCol + 
            '\<div class="col-xs-8 col-lg-5"\>' + 
            '\<li class=\"list-group-item ' + 
            liClass + '\"\>' + '<span title="' + new Date() + '">' +
            Msg.sender + ' -> ' + Msg.target + ': ' +
            Msg.msg + '\</span\>\</li\>\</div\>' + endCol);
    } else if (Msg.msgType !== 'notice') {
        $(document).ready(function () {
            $(liSelector).append(startCol + 
                '\<div class="col-xs-8 col-lg-5"\>' + 
                '\<li class=\"list-group-item ' + 
                liClass + '\"\>' + '<span title="' + new Date() + '">' +
                Msg.sender + ': ' +
                Msg.msg + '\</span\>\</li\>\</div\>' + endCol);
        });  
    } else {
        $(document).ready(function () {
            $(liSelector).append(startCol + 
                '\<div class="col-xs-10 col-lg-10"\>' + 
                '\<li class=\"list-group-item ' + 
                liClass + '\"\>' + '<span title="' + new Date() + '">[' +
                Msg.sender + '] ' + Msg.msg + '\</span\>\</li\>\</div\>' 
                + endCol);

        });
    }
    scrollDown();
}