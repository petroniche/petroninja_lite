function mapboxSetup(zoomlevel){
    //API KEYS
    PetroNinjaData.setApiKey('PETRO NINJA API KEY HERE');
    mapboxgl.accessToken = 'MAPBOX TOKEN HERE';

    //Map Boundaries
    var sw = new mapboxgl.LngLat(-142.5796, 47.9438);
    var ne = new mapboxgl.LngLat(-97.84937, 61.0609);
    var maxBounds = new mapboxgl.LngLatBounds(sw, ne);

    var map = new mapboxgl.Map({
        container: "map",
        attributionControl: true,
        style: {version: 8, sources: {}, layers: []},
        center: [-114.0708, 51.0486],
        zoom: zoomlevel,
        maxZoom: 18,
        maxBounds: maxBounds
    }); 

    map.setStyle("mapbox://styles/sbilston/ciza0vsss003f2roiutcx99d6?9");

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    var geolocate = new mapboxgl.GeolocateControl({positionOptions: {
            enableHighAccuracy: true
        }
    });

    map.addControl(geolocate, 'bottom-right');

    //Disable Rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    $("#search_button").on('click', function(e){
        console.log("clicked");
        searchWell($("input#search-input").val().trim().toUpperCase());
    });

    $('#search-input').keypress(function (e) {
      if (e.which == 13) {
        searchWell($("input#search-input").val().trim().toUpperCase());
        return false;
      }
    });


    $("#uwi_list").change(function(){
        changeEvent($("#uwi_list").val());
    });


    return map;
}

function wellAndCameraLayers(){
    //Layers defined in mapbox studio (not added dynamically)
    mapbox_style_layers = ['ab-wellbores-1-abandoned_gas', 'ab-wellbores-2-abandoned_injection', 'ab-wellbores-3-abandoned_oil', 'ab-wellbores-4-abandoned_source', 'ab-wellbores-5-dry_or_abandoned', 'ab-wellbores-6-gas','ab-wellbores-7-injection','ab-wellbores-8-location', 'ab-wellbores-10-oil', 'ab-wellbores-11-source', 'ab-wellbores-12-suspended_gas', 'ab-wellbores-13-suspended_injection','ab-wellbores-14-suspended_oil','ab-wellbores-15-suspended_source'];

    //Add Mapbox Style Layers to Layer List
    layer_list = mapbox_style_layers.slice(0);
    layer_list.push('ab-cameras');

    return layer_list;
}

function satelitteToggle(){
    //Satelite Button
    var switchy = document.getElementById('satellite-button');
    switchy.addEventListener("click", function(){
        switchy = document.getElementById('satellite-button');
        if (switchy.className === 'on') {
            switchy.setAttribute('class', 'off');
            map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none');
            switchy.innerHTML = "<a class='list-button' id='satellite-button'><i class='fa fa-globe'> Satellite</i></a>";
        } else {
            switchy.setAttribute('class', 'on');
            map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'visible');
            switchy.innerHTML = "<a class='list-button' id='satellite-button'><i class='fa fa-map'> Map</i></a>";
        }
    });
}



function selectWell(lat, lng, symbol){
    console.log("selecting well" + symbol);
    //Get Lat/Lng
    var destination = [lng,lat];

    //Create a point
    var point = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": destination
            }
        }]
    };

    //Remove old/previous selected points
    if (map.getSource('point')){
        map.removeSource('point');
    }
    if (map.getLayer('point')) {
        map.removeLayer('point');
    }

    map.addSource('point', {
        "type": "geojson",
        "data": point
    });

    map.addLayer({
        "id": "point",
        "source": "point",
        "type": "symbol",
        "layout": {
            "icon-image": "well_selected_symbol"+symbol
        }
    });

}

function selectAndFlyToWellByUWI(uwi){
    $(".spinner-container").show();
    PetroNinjaData.getBasicWellData(uwi, function(data){
        result = JSON.parse(data.response);
        $(".spinner-container").hide();
        selectWell(result['BottomHoleLocationLat'], result['BottomHoleLocationLong'], result['Symbol']);
        flyToStore([result['BottomHoleLocationLong'], result['BottomHoleLocationLat']] );
    });
}

function flyToStore(coordinates) {
  map.flyTo({
    center: coordinates,
    zoom: 13
  });
}

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

function searchWell(searchString){
    console.log("searching");
    $(".spinner-container").show();
    PetroNinjaData.wellSearch(searchString, function(data){
        $(".spinner-container").hide();
        result = JSON.parse(data.response);
        if (result['error_message']){
            $( "#search_results" ).show();
        }
        else {
            $( "#search_results" ).hide();

            //remove well info if another well is currently selected
            $("#table_production").find("tbody").empty();
            $(".aside-button").removeClass("active");
            $("#layer2").fadeOut("fast");
            

            if (result['Well']['ResultType'] == 'Township'){
                $(document).trigger("close-aside");
                $("#uwi_list").prev().html('');
                var coordinates = [result['Well']['Lng'], result['Well']['Lat'] ];
                flyToStore(coordinates);
            }
            else {        
                var coordinates = [result['Well']['Lng'], result['Well']['Lat'] ];
                selectWell(result['Well']['Lat'], result['Well']['Lng'], result['Well']['Symbol']);
                flyToStore(coordinates);
                quickWellInfo(result['Well']['Title'])
            }
        }                
    });
}




function changeEvent(uwi){
    $(".spinner-container").show();
    PetroNinjaData.getWellData(uwi, function(data){
            renderEventSpecificData(JSON.parse(data.response));
            $(".spinner-container").hide();
    });
    PetroNinjaData.getWellProductionData(uwi, function(data){
            renderProductionData(JSON.parse(data.response));
            $(".spinner-container").hide();
    });
}

function quickWellInfo(WellID){
    $(".spinner-container").show();
    PetroNinjaData.getWellData(WellID, function(data){
        renderWellData(JSON.parse(data.response));
        renderEventSpecificData(JSON.parse(data.response));
        $(".spinner-container").hide();
    })
    PetroNinjaData.getWellProductionData(WellID, function(data){
        renderProductionData(JSON.parse(data.response));
        $(".spinner-container").hide();
    });
    PetroNinjaData.getWellEvents(WellID, function(data){
        renderWellEvents(JSON.parse(data.response), WellID);
        $(".spinner-container").hide();
    });
}

function renderWellData(data){
    // Reset the copied to clipboard indicator
    $("#copied").empty();

    // Hide the search results if they are shown
    $("#search_results").hide();

    // Well Detail
    var nf = new Intl.NumberFormat();

    $("#license").html(data['LicenseNumber']);
    $("#surface_uwi_value, #surface_uwi_value2").html(data['SurfaceHole']);
    $("#licensee_value, #licensee_value2").html(data['FacilityOperator']);
    $("#well_fluid_value").html(data['Fluid']);
    $("#well_status_value").html(data['Status']);
    $("#well_type_value").html(data['Type']);
    $("#license_date").html(data['LicenseDate']);
    $("#well_lat").html(data['SurfaceHoleLocationLat']);
    $("#well_lng").html(data['SurfaceHoleLocationLong']);
    $("#uwi_id").html(data['UWI']);
    $("#producing_formation").html(data['ProducingFormation']);


    var g_link = 'https://maps.google.com?saddr=Current+Location&daddr='+ data['SurfaceHoleLocationLat'] + ',' + data['SurfaceHoleLocationLong'];

    $("#google_directions").html('<a target="_blank" href="'+ g_link +'">View printable directions on Google Maps</a>');


    $("#well_url").val("https://www.petroninja.com/wells/" + data['UWI']);

    //Completions And Casings
    var treatments = data['Treatments'];

    $("#table_completions tbody").empty();
    treatments.forEach( function(item, index, array) {
        if ( $('input#cmn-toggle-7').is(':checked') ) {
            $("#table_completions tbody").append("<tr>" +
                "<td>"+item['Date']+"</td>" +
                "<td>"+item['LowerDepth']+"</td>" +
                "<td>"+item['UpperDepth']+"</td>" +
                "<td>"+item['Formation']+"</td>" +
                "<td>"+item['Treatment']+"</td></tr>");
        } else {
            $("#table_completions tbody").append("<tr>" +
                "<td>"+item['Date']+"</td>" +
                "<td>"+nf.format(_.round(item['LowerDepth'] * 3.28084, 1))+"</td>" +
                "<td>"+nf.format(_.round(item['UpperDepth'] * 3.28084, 1))+"</td>" +
                "<td>"+item['Formation']+"</td>" +
                "<td>"+item['Treatment']+"</td></tr>");
        }
    });

    var casings = data['Casings'];

    //Render Casings
    $("#table_casings tbody").empty();

    casings.forEach(function(item, index, array) {
        if ( $('input#cmn-toggle-7').is(':checked') ) {
            $("#table_casings tbody").append("<tr>" +
                "<td>"+item['TubeType']+"</td>" +
                "<td>"+item['Size']+"</td>" +
                "<td>"+item['UpperDepth']+"</td>" +
                "<td>"+item['LowerDepth']+"</td>" +
                "<td>"+item['SteelSpec']+"</td>" +
                "<td>"+item['TubeDensity']+"</td></tr>");
        } else {
            $("#table_casings tbody").append(
                "<tr>" +
                "<td>"+item['TubeType']+"</td>" +
                "<td>"+nf.format(_.round(item['Size'] * 0.0393701, 1))+"</td>" +
                "<td>"+nf.format(_.round(item['UpperDepth'] * 3.28084, 1))+"</td>" +
                "<td>"+nf.format(_.round(item['LowerDepth'] * 3.28084, 1))+"</td>" +
                "<td>"+item['SteelSpec']+"</td>" +
                "<td>"+nf.format(_.round(item['TubeDensity'] * 0.671969, 1))+"</td></tr>");
        }
    });

    $(document).trigger("generate-tables");
    $(document).trigger("open-aside");
}

function renderBasicWellData(data){
    // Reset the copied to clipboard indicator
    $("#copied").empty();

    // Hide the search results if they are shown
    $("#search_results").hide();

    $("#search-input").val(data['AliasFullName']);

    $("#license").html(data['LicenseNumber']);
    $("#surface_uwi_value, #surface_uwi_value2").html(data['SurfaceHole']);
    $("#licensee_value, #licensee_value2").html(data['FacilityOperator']);
    $("#well_lat").html(data['SurfaceHoleLocationLat']);
    $("#well_lng").html(data['SurfaceHoleLocationLong']);
    $("#uwi_id").html(data['UWI']);

    $("#well_url").val("https://www.petroninja.com/wells/" + data['UWI']);

    $(document).trigger("generate-tables");
    $(document).trigger("open-aside");
    $(document).trigger("generate-production-tables");
}

function renderEventSpecificData(data){
    var nf = new Intl.NumberFormat();

    $("#search-input").val(data['AliasFullName']);
    
    //General
    $("#well_name").html(data['WellName']);

    //Dates & Drilling Info
    $("#spud_date").html(data['SpudDate']);
    $("#rig_release_date").html(data['RigReleaseDate']);
    $("#prod_date").html(data['OnProdDate']);
    $("#rig_no").html(data['RigNo']);
    $("#pool_name").html(data['Pool']);

    //Render Depths
    //If Metric Else Imperial
    if ( $('input#cmn-toggle-7').is(':checked') ) {
        $("#kb_elevation").html(data['KBElevation'] +' m');
        $("#ground_elevation").html(data['GroundElevation'] +' m');
        $("#projected_total_depth").html(data['PbDepth'] +' m');
        $("#tvd").html(data['MaxTrueVerticalDepth'] +' m');
        $("#total_depth").html(data['TotalDepth'] +' m');
    }
    else {
        $("#kb_elevation").html(nf.format(_.round(data['KBElevation'] * 3.28084, 1))  +' ft');
        $("#ground_elevation").html(nf.format(_.round(data['GroundElevation'] * 3.28084, 1))  +' ft');
        $("#projected_total_depth").html(nf.format(_.round(data['PbDepth'] * 3.28084, 1)) +' ft');
        $("#tvd").html(nf.format(_.round(data['MaxTrueVerticalDepth'] * 3.28084, 1)) +' ft');
        $("#total_depth").html(nf.format(_.round(data['TotalDepth'] * 3.28084, 1)) +' ft');
    }
}

function renderWellEvents(events, selected_event){
    // Change the search input to show currently selected well
    // $("#search-input").val(events[0]['AliasFullName']);

    //Set Events for the UWI
    $("#uwi_list").find("option").remove().end();
    // var events = data['WellEvents'];
    
    var selected_event_formatted = '';  
    events.forEach( function(item, index, array) {
        $("#uwi_list").append(
            $("<option></option>").val(item['UWI']).html(item['AliasFullName'])
        );
        if (item['UWI'] == selected_event) {
            // $("#search-input").val(item['AliasFullName']);
            // selected_event_formatted = item['AliasFullName'];
        }
    });

    
    $("#uwi_list").val(selected_event);

    $("#uwi_list").parent("div").removeClass().addClass("events"+ events.length)
    if (events.length === 1) {
        $("#uwi_list").prop("disabled", true).hide();
        $("#uwi_list").prev().html("This well only has 1 event");
    } else {
        $("#uwi_list").prop("disabled", false).show();
        $("#uwi_list").prev().html("This well has " + events.length + " events:");
    };
}

function renderProductionData(production) {
    //Render Production
    
    $("#table_production").find("tbody").empty();

    if (production) {
        var first_record = 0; 
        production.forEach(function(item, index, array) {
            if (first_record == 0 && item['OIL_VOLUME'] ==0 && item['GAS_VOLUME'] ==0 && item['WATER_VOLUME'] ==0 && item['INJECTION_VOLUME'] ==0 ) {
                first_record=0;
            } else {
                var date = item['DATE'].split("-");
                var month = date[1];
                var year = date[0]

                if ( $('input#cmn-toggle-7').is(':checked') ) {
                    $("#table_production tbody").append("<tr>" +
                        "<td>"+ year + "-"+ month + "</td> " +
                        "<td>"+ item['OIL_VOLUME'] + "</td>" +
                        "<td>"+ item['OIL_CALENDAR_DAY'] + "</td>"+
                        "<td>"+ item['GAS_VOLUME'] + "</td>" +
                        "<td>"+ item['GAS_CALENDAR_DAY'] + "</td>" +
                        "<td>"+ item['WATER_VOLUME'] + "</td>" +
                        "<td>"+ item['WATER_CALENDAR_DAY'] +"</td>" +
                        "<td>"+ item['INJECTION_VOLUME']+"</td>" +
                        "<td>"+ item['INJECTION_CALENDAR_DAY']+"</td>"+
                        "</tr>");
                } else {
                    //Convert from cubic meter to barrels
                    $("#table_production tbody").append("<tr>"+
                        "<td>"+ year + "-" + month + "</td> " +
                        "<td>"+ _.round(item['OIL_VOLUME'] * 6.29, 2) + "</td>" +
                        "<td>"+ _.round((item['OIL_VOLUME'] * 6.29) / daysInMonth(month, year) , 2)  + "</td>"+
                        "<td>"+ _.round(item['GAS_VOLUME'] * 35.3147, 2)+ "</td>" +
                        "<td>"+ _.round((item['GAS_VOLUME'] * 35.3147) / daysInMonth(month, year) , 2)+ "</td>" +
                        "<td>"+ _.round(item['WATER_VOLUME'] * 6.29, 2) + "</td>" +
                        "<td>"+ _.round((item['WATER_VOLUME'] * 6.29) / daysInMonth(month, year), 2)+"</td>" +
                        "<td>"+ _.round(item['INJECTION_VOLUME'] * 6.29, 2)+"</td>" +
                        "<td>"+ _.round((item['INJECTION_VOLUME'] * 6.29) / daysInMonth(month, year), 2)+"</td>"+
                        "</tr>");
                } 
                first_record =1
            }
        });
    }

    $(document).trigger("generate-production-tables");
}