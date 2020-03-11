function mapboxSetup(zoomlevel, homeLocation, custom_style) {
    //API KEYS
    PetroNinjaData.setApiKey('PETRO NINJA API KEY HERE'); // insert the API key here
    mapboxgl.accessToken = 'MAPBOX TOKEN HERE'; // insert the token here

    //Map Boundaries
    var sw = new mapboxgl.LngLat(-142.5796, 47.9438);
    var ne = new mapboxgl.LngLat(-97.84937, 61.0609);
    var maxBounds = new mapboxgl.LngLatBounds(sw, ne);

    var map = new mapboxgl.Map({
        container: "map",
        attributionControl: true,
        style: { version: 8, sources: {}, layers: [] },
        center: homeLocation,
        zoom: zoomlevel,
        maxZoom: 18,
        maxBounds: maxBounds
    });


    if (custom_style) {
        map.setStyle(custom_style)
    } else {
        map.setStyle("mapbox://styles/sbilston/ck178vsq702h41cl3ejn511g9");
    }

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    var geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        }
    });

    map.addControl(geolocate, 'bottom-right');

    //Disable Rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    $("#search_button").on('click', function (e) {
        searchWell($("input#search-input").val().trim().toUpperCase());
    });

    $('#search-input').keypress(function (e) {
        if (e.which == 13) {
            searchWell($("input#search-input").val().trim().toUpperCase());
            return false;
        }
    });


    $("#uwi_list").change(function () {
        changeEvent($("#uwi_list").val());
    });

    return map;
}