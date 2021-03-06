
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

function closeAllLeftSideBars() {
    $(document).trigger("close-aside");
}

$(".right-sidebar-vertical-close").click(function () {
    closeRightSidebar()
});

$(".right-sidebar-vertical-open").click(function () {
    $(".right-container").toggle("slide", { direction: "right" }, 600);
    $(".mapboxgl-ctrl.mapboxgl-ctrl-group").css({ 'margin-right': '29rem' });
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
$(document).ajaxStart(function () {
    $(".spinner").show();
});

// hide spinner on AJAX stop
$(document).ajaxStop(function () {
    $(".spinner").hide();
});

$("#uwi_list").change(function () {
    changeEvent($("#uwi_list").val());
});

function closeRightSidebar() {
    $(".right-container").toggle("slide", { direction: "right" }, 600);
    $(".mapboxgl-ctrl.mapboxgl-ctrl-group").css({ 'margin-right': '2rem' });
    if ($(".secondary-right-sidebar").is(":visible")) {
        $(".secondary-right-sidebar").toggle("slide", { direction: "right" }, 600);
    }
    if ($(".tertiary-right-sidebar").is(":visible")) {
        $(".tertiary-right-sidebar").toggle("slide", { direction: "right" }, 600);
    }
}
