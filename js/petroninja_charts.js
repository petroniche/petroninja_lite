//= require datatables.min.js
//= require datatables.buttons.min.js

$(function () {

	/**
	 * Define a plugin that replaces zeros in data with null
	 */
	AmCharts.addInitHandler(function(chart) {
	  
	  // iterate through data
	  for(var i = 0; i < chart.dataProvider.length; i++) {
	    var dp = chart.dataProvider[i];
	    for(var x in dp) {
	      if (dp.hasOwnProperty(x) && !isNaN(dp[x]) && dp[x] == 0)
	        dp[x] = null;
	    }
	  }
	  
	}, ["serial"]);


	var tableCompletions = null;
	var tableCasings = null;
	var tableProduction = null;

	$(document).on("generate-tables", function () {
		if (tableCompletions === null) {
			tableCompletions = $("#table_completions").DataTable({
				"dom": "Bt",
				"bAutoWidth": false,
				"buttons": [
					{
						extend: "csv"
					},
					{
						extend: "pdf"
					}
				],
				"pageLength": -1,
				"order": [[0, "desc"]],
				"columnDefs": [{
					"width": "17%",
					"targets": [0, 1, 2, 3]
				}]
			});
		} else if ($("#table_completions td").length > 1) {
			var tableCompletionsData = [];
			$("#table_completions tbody tr").each(function () {
				var row = [];
				$(this).find("td").each(function () {
					row.push($(this).text());
				});
				tableCompletionsData.push(row);
			});
			tableCompletions.clear();
			tableCompletions.rows.add(tableCompletionsData).draw();
		};

		if (tableCasings === null) {
			tableCasings = $("#table_casings").DataTable({
				"dom": "Bt",
				"bAutoWidth": false,
				"buttons": [
					{
						extend: "csv"
					},
					{
						extend: "pdf"
					}
				],
				"pageLength": -1,
				"order": [[0, "asc"]],
				"columnDefs": [{
					"width": "17%",
					"targets": [0, 1, 2, 3]
				}]
			});
		} else if ($("#table_casings td").length > 1) {
			var table_casings = [];
			$("#table_casings tbody tr").each(function () {
				var row = [];
				$(this).find("td").each(function () {
					row.push($(this).text());
				});
				table_casings.push(row);
			});
			tableCasings.clear();
			tableCasings.rows.add(table_casings).draw();
		};
	});

	$(document).on("generate-production-tables", function () {
		if (tableProduction === null) {
			tableProduction = $("#table_production").DataTable({
				"dom": "B<'table-container't>",
				"bAutoWidth": false,
				"buttons": [
					{
						extend: "csv"
					},
					{
						extend: "pdf"
					}
				],
				"pageLength": -1,
				"order": [[0, "asc"]],
				"columnDefs": [{
					"render": $.fn.dataTable.render.number(",", ".", 2),
					"targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
					"width": "11%"
				}, {
					"targets": [0],
					"width": "11%"
				}, {
					"targets": [1, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 16],
					"visible": false
				}]
			});
		} else if ($("#table_production td").length > 1) {
			var table_production = [];
			$("#table_production tbody tr").each(function () {
				var row = [];
				$(this).find("td").each(function () {
					row.push($(this).text());
				});
				table_production.push(row);
			});
			tableProduction.clear();
			tableProduction.rows.add(table_production).draw();
		} else {
			tableProduction.clear();
		};
		drawChartProduction(tableProduction, $("#log").is(":checked"), $("input[name='switch_3']:checked").val(), $('input[name=metric]:checked').val());
	});

	function drawChartProduction(tableProduction, log, pivot_type, metric) {
		var arrays = tableProduction.rows().data().toArray();
		arrays.sort();

		if (arrays.length <= 1) {
			$("a[data-val='well_chart']").addClass("disabled");
			$(".aside-button").removeClass("active");
			$("#layer2").fadeOut("fast");
		} else {
			$("a[data-val='well_chart']").removeClass("disabled");
			var columns = [];
			var water = 0;
			var injection = 0;
			for (var i = 0; i < arrays.length; i++) {
				columns.push({
					"month": arrays[i][0],
					"oil": arrays[i][1],
					"daily_oil": arrays[i][2],
					"producing_oil": arrays[i][3],
					"gas": arrays[i][4],
					"daily_gas": arrays[i][5],
					"producing_gas": arrays[i][6],
					"water": arrays[i][7],
					"daily_water": arrays[i][8],
					"producing_water": arrays[i][9],
					"injection": arrays[i][10],
					"daily_injection": arrays[i][11],
					"producing_injection": arrays[i][12],
					"cumulative_gas": arrays[i][13],
					"cumulative_oil": arrays[i][14],
					"cumulative_water": arrays[i][15],
					"cumulative_injection": arrays[i][16]
				});
				water += parseFloat(arrays[i][7]);
				injection += parseFloat(arrays[i][10]);
			};

			var chart = AmCharts.makeChart("chart-production", {
				"type": "serial",
				"dataProvider": columns,
				"legend": {
					"position": "top",
					"useGraphSettings": true,
					"valueAlign": "left"
				},
				"valueAxes": [{
					"id": "v1",
					"axisColor": "green",
					"axisAlpha": 1,
					"logarithmic": log,
					"precision": 2,
					"title": ((pivot_type == "daily" ? "Daily Oil / " : (pivot_type == "monthly" ? "Monthly Oil / " : (pivot_type == "cumulatives" ? "Cumulative Oil /" : "Producing Oil /"))) + (water ? "Water " : "Injection ") + (metric == "true" ? "(m3)" : "(bbl)")),
					"titleColor": "green",
					"treatZeroAs": log ? 0.0001 : 0,
					"position": "left"
    }, {
					"id": "v2",
					"axisColor": "red",
					"axisAlpha": 1,
					"logarithmic": log,
					"precision": 2,
					"title": (pivot_type == "daily" ? "Daily Gas " : (pivot_type == "monthly" ? "Monthly Gas " : (pivot_type == "cumulatives" ? "Cumulative Gas" : "Producing Gas "))) + (metric == "true" ? "(e3m3)" : "(mcf)"),
					"titleColor": "red",
					"treatZeroAs": log ? 0.0001 : 0,
					"position": "right"
    }],
				"graphs": [{
					"bullet": "round",
					"connect": false,
					"bulletBorderAlpha": 1,
					"bulletColor": "white",
					"bulletSize": 4,
					"hideBulletsCount": 50,
					"lineColor": "green",
					"lineThickness": 2,
					"title": (pivot_type == "daily" ? "Daily Oil" : (pivot_type == "monthly" ? "Monthly Oil" : (pivot_type == "producing" ? "Producing Oil" : "Cumulative Oil"))),
					"useLineColorForBulletBorder": true,
					"valueAxis": "v1",
					"valueField": (pivot_type == "daily" ? "daily_oil" : (pivot_type == "monthly" ? "oil" : (pivot_type == "producing" ? "producing_oil" : "cumulative_oil")))
    }, {
					"bullet": "round",
					"connect": false,
					"bulletBorderAlpha": 1,
					"bulletColor": "white",
					"bulletSize": 4,
					"hideBulletsCount": 50,
					"lineColor": "red",
					"lineThickness": 2,
					"title": (pivot_type == "daily" ? "Daily Gas" : (pivot_type == "monthly" ? "Monthly Gas" : (pivot_type == "producing" ? "Producing Gas" : "Cumulative Gas"))),
					"useLineColorForBulletBorder": true,
					"valueAxis": "v2",
					"valueField": (pivot_type == "daily" ? "daily_gas" : (pivot_type == "monthly" ? "gas" : (pivot_type == "producing" ? "producing_gas" : "cumulative_gas")))
    }],
				"chartScrollbar": {},
				"chartCursor": {
					"categoryBalloonDateFormat": "MMM YYYY",
					"cursorColor": "black",
					"fullWidth": true,
					"valueLineEnabled": true,
					"valueLineBalloonEnabled": true,
					"cursorAlpha": .1
				},
				"dataDateFormat": "YYYY-MM",
				"categoryField": "month",
				"categoryAxis": {
					"minPeriod": "MM",
					"parseDates": true
				},
				"export": {
					"enabled": true
				}
			});

			if (water) {
				var g = new AmCharts.AmGraph();
				g.bullet = "round";
				g.bulletColor = "white";
				g.bulletBorderAlpha = 1;
				g.bulletSize = 4;
				g.connect = false;
				g.hideBulletsCount = 50;
				g.lineColor = "dodgerblue"
				g.lineThickness = 1.5;
				g.title = (pivot_type == "daily" ? "Daily Water" : (pivot_type == "monthly" ? "Monthly Water" : (pivot_type == "producing" ? "Producing Water" : "Cumulative Water")));
				g.useLineColorForBulletBorder = true;
				g.valueAxis = "v1";
				g.valueField = (pivot_type == "daily" ? "daily_water" : (pivot_type == "monthly" ? "water": (pivot_type == "producing" ? "producing_water" : "cumulative_water")));
				chart.addGraph(g);
			};

			if (injection) {
				var g = new AmCharts.AmGraph();
				g.bullet = "round";
				g.bulletColor = "white";
				g.bulletBorderAlpha = 1;
				g.bulletSize = 4;
				g.connect = false;
				g.hideBulletsCount = 50;
				g.lineColor = "purple";
				g.lineThickness = 1.5;
				g.title = (pivot_type == "daily" ? "Daily Injection" : (pivot_type == "monthly" ? 'Monthly Injection' : (pivot_type == "producing" ? 'Producing Injection' : "Cumulative Injection")));
				g.useLineColorForBulletBorder = true;
				g.valueAxis = "v1";
				g.valueField = (pivot_type == "daily" ? "daily_injection" : (pivot_type == "monthly" ? injection : (pivot_type == "producing" ? "producing_injection": "cumulative_injection")));
				chart.addGraph(g);
			};
		};
	};



	// 100/02-34-018-16W4/00
	$("#log").change(function () {
		drawChartProduction(tableProduction, $("#log").is(":checked"),  $("input[name='switch_3_chart']:checked").val(), $('input[name=metric]:checked').val());
	});

	$("input[name='switch_3']").change(function (){
		var pivot_type = $("input[name='switch_3']:checked").val();

		if (pivot_type == 'daily'){
			tableProduction.columns([2, 5, 8, 11]).visible(true);
			tableProduction.columns([1, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 16]).visible(false);
		}
		else if (pivot_type == 'monthly'){
			tableProduction.columns([1, 4, 7, 10]).visible(true);
			tableProduction.columns([2, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16]).visible(false);
		}
		else if (pivot_type == "producing"){
			tableProduction.columns([3, 6, 9, 12]).visible(true);
			tableProduction.columns([1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 15, 16]).visible(false);
		}
		else if (pivot_type == "cumulatives"){
			tableProduction.columns([13, 14, 15, 16]).visible(true);
			tableProduction.columns([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).visible(false);
		}
	})

	$("input[name='switch_3_chart']").change(function (){
		drawChartProduction(tableProduction, $("#log").is(":checked"),  $("input[name='switch_3_chart']:checked").val(), $('input[name=metric]:checked').val());
	});
});

	