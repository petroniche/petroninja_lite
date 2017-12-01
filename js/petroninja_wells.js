function mapboxSetup(zoomlevel, homeLocation, custom_style){
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
        center: homeLocation,
        zoom: zoomlevel,
        maxZoom: 18,
        maxBounds: maxBounds
    }); 

    
    if (custom_style) {
        map.setStyle(custom_style)
    } else {
        map.setStyle("mapbox://styles/sbilston/cj8aespwi6c3t2ro49hd1xwab?3");
    }

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

function wellClick(e){
        //remove well info if another well is currently selected
        $("#table_production").find("tbody").empty();
        $(".aside-button").removeClass("active");
        $("#layer2").fadeOut("fast");

        selectWell(e.features[0].properties.WellID);
        quickWellInfo(e.features[0].properties.WellID);
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


function selectWell(wellID){
    //Get Current Filter
    var current_filter = map.getFilter('all-wells');
    map.setFilter('all-wells', current_filter);

    var sobj = {"property": 'WellID',
        "type":'categorical', 
        "stops": [[wellID,'#8b0000']]
    };

    var bold = {"property": 'WellID',
        "type":'categorical', 
        "stops": [[wellID,20]]
    };

    var thick = {"property": 'WellID',
        "type":'categorical', 
        "stops": [[wellID, 2]]
    };
    map.setPaintProperty('all-wells', 'text-color', sobj);
    map.setLayoutProperty('all-wells', 'text-size', bold);

    map.setPaintProperty('wellbore-lines', 'line-color', sobj);
}

function selectAndFlyToWellByUWI(uwi){
    $(".spinner-container").show();
    PetroNinjaData.getBasicWellData(uwi, function(data){
        result = JSON.parse(data.response);
        $(".spinner-container").hide();
        selectWell(result['UWI']);
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
                console.log(result['Well']['Title']);
                var coordinates = [result['Well']['Lng'], result['Well']['Lat'] ];
                map.setFilter('all-wells', ["any", ['==', 'is_active_event', 'active'], ['==', 'WellID', result['Well']['Title']]]);
                flyToStore(coordinates);
                selectWell(result['Well']['Title']);
                // console.log(result);
                // addWell(result['Well']['Lat'], result['Well']['Lng'], result['Well']['Symbol']);
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


function renderWellData(data){
    // Reset the copied to clipboard indicator
    $("#copied").empty();
    $(document).trigger("close-pipeline-aside");

    // Hide the search results if they are shown
    $("#search_results").hide();

    
    var _href = $("#set-home-location").attr("href"); 
    $("#set-home-location").attr("href", _href + '?home_lat='+data['BottomHoleLocationLat']+'&home_lng='+data['BottomHoleLocationLong']);


    //Set well message uwi
    if($("#channel-message-uwi")){
        $("#channel-message-uwi").val(data['UWI']);
    }
    
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
    $("#projected_formation").html(data['ProjectedFormation']);
    $("#producing_formation, #producing_formation2").html(data['ProducingFormation']);
    $("#on_prod_date").html(data['OnProdDate']);
    $("#field, #field2").html(data['Field'])


    var g_link = 'https://maps.google.com?saddr=Current+Location&daddr='+ data['SurfaceHoleLocationLat'] + ',' + data['SurfaceHoleLocationLong'];

    $("#google_directions").html('<a target="_blank" href="'+ g_link +'">View printable directions on Google Maps</a>');


    $("#well_url").val("https://www.petroninja.com/wells/" + data['UWI']);

    //Completions And Casings
    var treatments = data['Treatments'];

    $("#table_completions tbody").empty();
    treatments.forEach( function(item, index, array) {
        if ( $('input[name=metric]:checked').val() == "true" ) {
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
        if ( $('input[name=metric]:checked').val() == 'true' ) {
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
    if ( $('input[name=metric]:checked').val() == 'true' ){
        $("#kb_elevation").html(data['KBElevation'] +' m');
        $("#ground_elevation").html(data['GroundElevation'] +' m');
        $("#tvd").html(data['MaxTrueVerticalDepth'] +' m');
        $("#total_depth").html(data['TotalDepth'] +' m');
    }
    else {
        $("#kb_elevation").html(nf.format(_.round(data['KBElevation'] * 3.28084, 1))  +' ft');
        $("#ground_elevation").html(nf.format(_.round(data['GroundElevation'] * 3.28084, 1))  +' ft');
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
    var nf = new Intl.NumberFormat();

    $("#table_production").find("tbody").empty();

    if (production) {
        var first_record = 0; 
        var max_cumulative_oil = 0;
        var max_cumulative_gas = 0;
        var max_cumulative_water = 0;

        production.forEach(function(item, index, array) {
            if (first_record == 0 && item['OIL_VOLUME'] ==0 && item['GAS_VOLUME'] ==0 && item['WATER_VOLUME'] ==0 && item['INJECTION_VOLUME'] ==0 ) {
                first_record=0;
            } else {
                var date = item['DATE'].split("-");
                var month = date[1];
                var year = date[0]

                if ( $('input[name=metric]:checked').val() == 'true' ) {
                    $("#table_production tbody").append("<tr>" +
                        "<td>"+ year + "-"+ month + "</td> " +
                        "<td>"+ item['OIL_VOLUME'] + "</td>" +
                        "<td>"+ item['OIL_CALENDAR_DAY'] + "</td>"+
                        "<td>"+ item['OIL_PRODUCING_DAILY'] + "</td>"+
                        "<td>"+ item['GAS_VOLUME'] + "</td>" +
                        "<td>"+ item['GAS_CALENDAR_DAY'] + "</td>" +
                        "<td>"+ item['GAS_PRODUCING_DAILY'] + "</td>"+
                        "<td>"+ item['WATER_VOLUME'] + "</td>" +
                        "<td>"+ item['WATER_CALENDAR_DAY'] +"</td>" +
                        "<td>"+ item['WATER_PRODUCING_DAILY'] + "</td>"+
                        "<td>"+ item['INJECTION_VOLUME']+"</td>" +
                        "<td>"+ item['INJECTION_CALENDAR_DAY']+"</td>"+
                        "<td>"+ item['INJECTION_PRODUCING_DAILY'] + "</td>"+
                        "<td>"+ item['CUMGAS'] + "</td>"+
                        "<td>"+ item['CUMOIL'] + "</td>"+
                        "<td>"+ item['CUMWATER'] + "</td>"+
                        "<td>"+ item['CUMINJECTION'] + "</td>"+
                        "</tr>");
                } else {
                    //Convert from cubic meter to barrels
                    $("#table_production tbody").append("<tr>"+
                        "<td>"+ year + "-" + month + "</td> " +
                        "<td>"+ _.round(item['OIL_VOLUME'] * 6.29, 2) + "</td>" +
                        "<td>"+ _.round((item['OIL_VOLUME'] * 6.29) / daysInMonth(month, year) , 2)  + "</td>"+
                        "<td>"+ _.round((item['OIL_VOLUME'] * 6.29) / (item['PRODUCTION_HOURS'] / 24) , 2)  + "</td>"+
                        "<td>"+ _.round(item['GAS_VOLUME'] * 35.3147, 2)+ "</td>" +
                        "<td>"+ _.round((item['GAS_VOLUME'] * 35.3147) / daysInMonth(month, year) , 2)+ "</td>" +
                        "<td>"+ _.round((item['GAS_VOLUME'] * 35.3147) / (item['PRODUCTION_HOURS'] / 24) , 2)+ "</td>" +
                        "<td>"+ _.round(item['WATER_VOLUME'] * 6.29, 2) + "</td>" +
                        "<td>"+ _.round((item['WATER_VOLUME'] * 6.29) / daysInMonth(month, year), 2)+"</td>" +
                        "<td>"+ _.round((item['WATER_VOLUME'] * 6.29) / (item['PRODUCTION_HOURS'] / 24), 2)+"</td>" +
                        "<td>"+ _.round(item['INJECTION_VOLUME'] * 6.29, 2)+"</td>" +
                        "<td>"+ _.round((item['INJECTION_VOLUME'] * 6.29) / daysInMonth(month, year), 2)+"</td>"+
                        "<td>"+ _.round((item['INJECTION_VOLUME'] * 6.29) / (item['INJECTION_HOURS'] / 24), 2)+"</td>"+
                        "<td>"+ _.round(item['CUMGAS'] * 35.3147, 2) + "</td>"+
                        "<td>"+ _.round(item['CUMOIL'] * 6.29, 2) + "</td>"+
                        "<td>"+ _.round(item['CUMWATER'] * 6.29, 2) + "</td>"+
                        "<td>"+ _.round(item['CUMINJECTION'] * 6.29, 2) + "</td>"+
                        "</tr>");
                } 
                first_record =1

                // calculate max cumulative
                if (item['CUMGAS'] > max_cumulative_gas){
                    max_cumulative_gas = item['CUMGAS'];
                }

                if (item['CUMOIL'] > max_cumulative_oil){
                    max_cumulative_oil = item['CUMOIL'];
                }

                if (item['CUMWATER'] > max_cumulative_water){
                    max_cumulative_water = item['CUMWATER'];
                }

            }
        });

        //add total cumulatives
        if ( $('input[name=metric]:checked').val() == 'true' ){
            $('#cumulative-gas-val, #cumulative-gas-chart-val').html(nf.format(max_cumulative_gas) + " e3m3");
            $('#cumulative-oil-val, #cumulative-oil-chart-val').html(nf.format(max_cumulative_oil) + " m3");
            $('#cumulative-water-val, #cumulative-water-chart-val').html(nf.format(max_cumulative_water) + " m3");
        } else {
            $('#cumulative-gas-val, #cumulative-gas-chart-val').html(nf.format(_.round(max_cumulative_gas * 35.3147, 2)) + " mcf");
            $('#cumulative-oil-val, #cumulative-oil-chart-val').html(nf.format(_.round(max_cumulative_oil * 6.29, 2)) + " bbl" );
            $('#cumulative-water-val, #cumulative-water-chart-val').html(nf.format(_.round(max_cumulative_water* 6.29, 2)) + " bbl");
        }
    }

    $(document).trigger("generate-production-tables");
}

function showPipelineInfo(properties){
    $("#search_results").hide();

    $("#search-input").val("Pipeline " + properties['LICENCE_NO']);

    $("#pipeline_company").html(properties['COMP_NAME']);
    $("#pipeline_from_location").html(properties['FRM_LOC']);
    $("#pipeline_from_fac").html(properties['FROM_FAC']);
    $("#pipeline_h2s_content").html(properties['H2S_CONTNT']);
    $("#pipeline_last_occyr").html(properties['LAST_OCCYR']);
    $("#pipeline_license_number").html(properties['LICENCE_NO']);
    $("#pipeline_license_line_number").html(properties['LIC_LI_NO']);
    $("#pipeline_original_line_number").html(properties['ORIGLIN_NO']);
    $("#pipeline_original_license_number").html(properties['ORIG_LICNO']);
    $("#pipeline_out_diameter").html(properties['OUT_DIAMET']);
    $("#pipeline_pipegrade").html(properties['PIPE_GRADE']);
    $("#pipeline_maop").html(properties['PIPE_MAOP']);
    $("#pipeline_type").html(properties['PIPE_TYPE']);
    $("#pipeline_material").html(properties['PIP_MATERL']);
    $("#pipeline_pllicsegid").html(properties['PLLICSEGID']);
    $("#pipeline_pl_spec_id").html(properties['PL_SPEC_ID']);
    $("#pipeline_seg_length").html(properties['SEG_LENGTH']);
    $("#pipeline_seg_status").html(properties['SEG_STATUS']);
    $("#pipeline_substance").html(properties['SUBSTANCE']);
    $("#pipeline_to_fac").html(properties['TO_FAC']);
    $("#pipeline_to_location").html(properties['TO_LOC']);
    $("#pipeline_wall_thick").html(properties['WALL_THICK']);

    $(document).trigger("open-pipeline-aside")

}

function showFacilityInfo(properties){
    $("#search_results").hide();

    $("#search-input").val("Facility " + properties['Facility ID']);

    $("#facility_id").html(properties['Facility ID']);
    $("#facility_name").html(properties['Facility Name']);
    $("#facility_operator").html(properties['Operator']);
    $("#facility_status").html(properties['Status']);

    if(properties['Province'] == 'AB'){
        $(".ab_field").css('display', 'block');
        $(".bc_field").css('display', 'none');
    }
    else if (properties['Province'] == 'BC'){
        $(".bc_field").css('display', 'block');
        $(".ab_field").css('display', 'none');
    }

    //AB Only Fields
    $("#facility_subtype").html(properties['Facility Sub Type']);
    $("#facility_license_number").html(properties['License Number']);
    $("#facility_edct_descr").html(properties['EDCT_DESCR']);
    $("#facility_licensee").html(properties['Licensee']);



    //BC Only Fields
    $("#facility_location").html(properties['Facility Location']);
    $("#facility_approval_date").html(properties['Approval Date']);
    $("#facility_operations_date").html(properties['Operations State Date']);

    $(document).trigger("open-facility-aside")

}