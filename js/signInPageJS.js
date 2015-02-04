$(document).ready(function () {
    $('#user-pw-form').ajaxForm( {
        type: 'POST',
        beforeSubmit: preCall,
        success: console.log("Success"),
        dataType: 'json'
    })
});

function preCall(formData) {
    alert('' + formData);
}