$(document).ready(function () {
    $('#user-pw-form').ajaxForm( {
        type: 'POST',
        dataType: 'json',
        success: function (data, textStatus, jqHXR) {
        	if (typeof data.redirect === 'string')
        		window.location = data.redirect;
        }
    })
});

var reason = getURLParameter('unsuccessful');
if (reason !== null && reason !== undefined && typeof reason === 'string') {
	var startDiv = "<div class=\"alert alert-danger\">";
	var extraInfo = '';
	var endDiv = "</div>";
	var divSelector = '.insert-extra-info-here';
	switch(reason) {
		case 'user': 
			extraInfo = 'Your desired username is already in use.'; 
			break;
		case 'disp':
			extraInfo = 'Your desired display name is already in use.'; 
			break;
		case 'format':
			extraInfo = 'You haven\'t followed the formatting guidelines.'; 
			break;
		case 'error':
			extraInfo = 'An unknown error occurred... We don\'t' +
			'know why either.'; 
			break;
	}
	$(document).ready(function () {
		$(divSelector).append(startDiv + extraInfo + endDiv);
	});
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + 
  	'([^&;]+?)(&|#|;|$)').exec(location.search)||
  [,""])[1].replace(/\+/g, '%20'))||null
}