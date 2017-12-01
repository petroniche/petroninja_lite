
//Side Bar Control
$(document).on("open-aside", function () {
    closeAllLeftSideBars();
    $("aside, #search .btn-link").fadeIn("fast");
});

$(document).on("close-aside", function () {
    $("aside, #search .btn-link").fadeOut("fast", function () {
        $("aside").removeClass("expanded");
        $(".expand>.fa").removeClass("fa-compress").addClass("fa-expand");
    });
});

$(document).on("expand-aside", function () {
    $("aside").toggleClass("expanded");
    $(".expand>.fa").toggleClass("fa-expand fa-compress");
});

$(".expand").click(function () {
        $(document).trigger("expand-aside");
});

$(".close").click(function () {
    if ($(this).parent().parent().attr("id") === "subheader") {
        $("#search-input").val("");
        closeAllLeftSideBars();
    } else {
        $(".aside-button").removeClass("active");
        $("#layer2").fadeOut("fast");
    };
});

//Pipeline aside
$(document).on("open-pipeline-aside", function () {
    closeAllLeftSideBars()
    $("#aside-pipeline").fadeIn("fast");
});

$(document).on("close-pipeline-aside", function () {
    $("#aside-pipeline").fadeOut("fast", function () {
    });
});

//Facility aside
$(document).on("open-facility-aside", function () {
    closeAllLeftSideBars()
    $("#aside-facility").fadeIn("fast");
});
$(document).on("close-facility-aside", function () {
    $("#aside-facility").fadeOut("fast", function () {
    });
});

$(document).on("close-aside", function () {
    $("aside, #search .btn-link").fadeOut("fast", function () {
        $("aside").removeClass("expanded");
        $(".expand>.fa").removeClass("fa-compress").addClass("fa-expand");
    });
});

$(document).on("close-facility-aside", function () {
    $("#aside-facility").fadeOut("fast", function () {
    });
});

function closeAllLeftSideBars(){
    $(document).trigger("close-aside");
    $(document).trigger("close-facility-aside");
    $(document).trigger("close-pipeline-aside");
}

$(".right-sidebar-vertical-close").click(function() {
    closeRightSidebar()
});

$(".right-sidebar-vertical-open").click(function() {
    $(".right-container").toggle("slide", {direction: "right"}, 600);
    $(".mapboxgl-ctrl.mapboxgl-ctrl-group").css({'margin-right':'29rem'});
});


//Tab Selection
$(".aside-button").click(function () {
    if (!$(this).hasClass("disabled")) {
        if (!$(this).hasClass("active")) {
            $(".aside-button").removeClass("active");
            $(this).addClass("active");
            //          window.location.hash = $(this).data("val");
            $(".aside-section.hidden").hide();
            $("#" + $(this).data("val")).show();
            if ($(this).data("val") === "directions") {
                $("#layer2").fadeOut("fast", function () {
                    $(this).removeClass("active");
                });
            } else {
                $("#layer2").fadeIn("fast", function () {
                    $(this).addClass("active");
                });
            };
        } else {
            $(this).removeClass("active");
            $("#layer2").fadeOut("fast", function () {
                $(this).removeClass("active");
            });
        };
    };
});

// SPINNER

$(".spinner").hide();

// show spinner on AJAX start
$(document).ajaxStart(function(){
    $(".spinner").show();
});

// hide spinner on AJAX stop
$(document).ajaxStop(function(){
    $(".spinner").hide();
});

$("#uwi_list").change(function(){
    changeEvent($("#uwi_list").val());
});

function closeRightSidebar(){
    $(".right-container").toggle("slide", {direction: "right"}, 600);
    $(".mapboxgl-ctrl.mapboxgl-ctrl-group").css({'margin-right':'2rem'});
    if($(".secondary-right-sidebar").is(":visible")){
        $(".secondary-right-sidebar").toggle("slide", { direction: "right"}, 600);
    }
    if($(".tertiary-right-sidebar").is(":visible")){
        $(".tertiary-right-sidebar").toggle("slide", { direction: "right"}, 600);
    }
}

$("#satelitte-toggle input[type='checkbox']").on("change", function(val){
        if($("#satelitte-toggle input[type='checkbox']").is(':checked')){
            map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'visible');
        }else{
            map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none');
        }
    });

$("#pipeline-toggle input[type='checkbox']").on("change", function(val){
        if($("#pipeline-toggle input[type='checkbox']").is(':checked')){
            map.setLayoutProperty('ab-pipelines', 'visibility', 'visible');
        }else{
            map.setLayoutProperty('ab-pipelines', 'visibility', 'none');
        }
    });

$("#facilities-toggle input[type='checkbox']").on("change", function(val){
    if($("#facilities-toggle input[type='checkbox']").is(':checked')){
        map.setLayoutProperty('facilities', 'visibility', 'visible');
    }else{
        map.setLayoutProperty('facilities', 'visibility', 'none');
    }
});

$("#well-label-toggle input[type='checkbox']").on("change", function(val){
    if($("#well-label-toggle input[type='checkbox']").is(':checked')){
        map.setLayoutProperty('wellbore-labels', 'visibility', 'visible');
    }else{
        map.setLayoutProperty('wellbore-labels', 'visibility', 'none');
    }
});
