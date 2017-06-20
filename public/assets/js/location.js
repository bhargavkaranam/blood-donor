(function () {
    "use strict";

    var autocompleteMap;
    autocompleteMap = new google.maps.places.Autocomplete(
        (document.getElementById('autocomplete')),
        { types: ['geocode'], componentRestrictions: { country: "in" } }
    );
    autocompleteMap.addListener('place_changed', function () {

        var place = autocompleteMap.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for location: '" + place.name + "'");
            return;
        }
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var autocomplete = $("#autocomplete");
        if (autocomplete) {
            autocomplete.attr("lat", lat);
            autocomplete.attr("lng", lng);
            autocomplete.attr("pl_id", place.place_id);
        }
    })

        // get native location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var cordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var geo;
            geo = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(cordinates.lat, cordinates.lng);
            geo.geocode({
                latLng: latLng
            }, function (result, status) {
                if (status === 'OK') {
                    if (result[0]) {
                        var j = result[0].formatted_address;
                        var i = j.split(",");
                        var count = i.length;
                        var country = i[count - 1];
                        var state = i[count - 2];
                        var city = i[count - 3];
                        var autocomplete = $("#autocomplete");
                        if (autocomplete) {
                                        autocomplete.val(j);
                                        autocomplete.attr("lat", cordinates.lat);
                                        autocomplete.attr("lng", cordinates.lng);
                                        autocomplete.attr("pl_id", result[0].place_id);
                        }
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        });
    } else {
        /* geolocation IS NOT available */
    }
})();