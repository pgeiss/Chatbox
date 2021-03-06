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
	var extraInfo = 'This username and password combination is invalid.<br>' +
	'Try again.';
	var endDiv = "</div>";
	var divSelector = '.insert-extra-info-here';
	$(document).ready(function () {
		$(divSelector).append(startDiv + extraInfo + endDiv);
	});
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + 
  	'([^&;]+?)(&|#|;|$)').exec(location.search)||
  [,""])[1].replace(/\+/g, '%20'))||null
}