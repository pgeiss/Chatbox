var first = 	'<li class="dropdown">' +
                  	'<a href="#" class="dropdown-toggle"' +
                  	' data-toggle="dropdown"' +  
                  	' role="button" aria-haspopup="true"' +
                  	'aria-expanded="false">';
var third =      	'<span class="caret"></span></a>' +
                  '<ul class="dropdown-menu">' +
                    '<li><a href="/chat.html">Join chat</a></li>' +
                    '<li role="separator" class="divider"></li>' +
                    '<li><a href="#">Account</a></li>' +
                    '<li><a href="#">Log out</a></li>' +
                  '</ul></li>';

var second = '';
var cookieArray = document.cookie.split(';');
for (var i = 0; i < cookieArray.length; i++) {
	if (cookieArray[i].indexOf('user=') === 0) {
		second = cookieArray[i].substring('user='.length, 
			cookieArray[i].length);
		break;
	}
}

var classSelector = '.insert-user';
if (second !== '') {
	$(document).ready(function () {
		$(classSelector).append(first + second + third);
	});
}