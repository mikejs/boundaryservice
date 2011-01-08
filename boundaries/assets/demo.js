// Geocoder stuff
var geocoder = new google.maps.Geocoder();

function handle_geocode(results, status) {
    position = new Object();
    position.coords = new Object();
    
    lat = results[0].geometry.location.lat();
    lng = results[0].geometry.location.lng();
    
    // position object
    position.coords.latitude = lat;
    position.coords.longitude = lng;
    position.coords.accuracy = null;
    position.coords.altitude = null;
    position.coords.altitudeAccuracy = null;
    position.coords.heading = null;
    position.coords.speed = null;
    
    exportPosition(position);
}

function geocode(address) {
    // geocode request
    gr = { 'address': address };
    geocoder.geocode(gr, handle_geocode);
}

// Browser geolocation stuff
function googleMapShow(lat,long) {
    var latlng = new google.maps.LatLng(lat, long);
    var myOptions = {
        zoom: 14,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    var markerOpts = {
        position: latlng, 
        map: map
    };
    var mark = new google.maps.Marker(markerOpts);
}

// Use jQuery to display useful information about our position.
function exportPosition(position) {
    $('#georesults').html(
        '<div id="map_canvas" style="float: right; width: 440px; height: 250px; border: 2px solid #ccc"></div>' +
        '<p>' 
                + 'Latitude: ' + position.coords.latitude + '<br />'
                + 'Longitude: ' + position.coords.longitude + '<br />'
                + 'Accuracy: ' + position.coords.accuracy + '<br />'
                + 'Altitude: ' + position.coords.altitude + '<br />'
                + 'Altitude accuracy: ' + position.coords.altitudeAccuracy + '<br />'
                + 'Heading: ' + position.coords.heading + '<br />'
                + 'Speed: ' + position.coords.speed + '<br />'
        + '</p>'
    );
    googleMapShow(position.coords.latitude, position.coords.longitude,{ maximumAge:600000 });
    get_areas(position.coords.latitude, position.coords.longitude);
}

function errorPosition() {
    $('#georesults').html('<p>The page could not get your location.</p>');
}

// User boundary service to lookup what areas the location falls within
function get_areas(lat, lng) {
    var areas_html = '<h3>Your location falls within:</h3><table id="locations" border="0" cellpadding="0" cellspacing="0">';
    var url = 'http://{{ domain }}/api/1.0/boundary/?format=jsonp&contains='+lat+','+lng+'&callback=?';
    
    $.getJSON(url, function(data) {
        $.each(data.objects, function(i, object) {
            areas_html += '<tr><td>' + object.kind + '</td><td><strong>' + object.name + '</strong></td></td>';
        });
        areas_html += '</table>';
        $('#area-lookup').html(areas_html);
    });
    
}

// Other stuff
$(function(){
    // Show search form
    $('#not-where-i-am').click(function() {
        $(this).hide();
        $('#location-form').fadeIn();
    });
    
    // Clear input box on click, replace value on blur
    defaultval = $('#location-form input[type=text]').val(); 
    $('#location-form input[type=text]').focus(function() {
        if( this.value == defaultval ) {
            $(this).val("");
        }
    });
    
});

// And so it begins...
var query = {% if address %}'{{ address }}'{% else %}null{% endif %};

// Decide what location info to use
if ( query ) {
    geocode(query);
} else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(exportPosition, errorPosition);
} else {
    // If the browser isn't geo-capable, tell the user.
    $('#georesults').html('<p>Your browser does not support geolocation.</p>');
}
