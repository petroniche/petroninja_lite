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
					"targets": [1, 2, 3, 4, 5, 6, 7, 8],
					"width": "11%"
				}, {
					"targets": [0],
					"width": "11%"
				}, {
					"targets": [1, 3, 5, 7],
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
		drawChartProduction(tableProduction, $("#log").is(":checked"), $("#daily").is(":checked"), $("#metric").is(":checked"));
	});

	function drawChartProduction(tableProduction, log, daily, metric) {
		var arrays = tableProduction.rows().data().toArray();
		arrays.sort();

		if (arrays.length <= 1) {
			$("a[data-val='well_chart']").addClass("disabled");
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
					"gas": arrays[i][3],
					"daily_gas": arrays[i][4],
					"water": arrays[i][5],
					"daily_water": arrays[i][6],
					"injection": arrays[i][7],
					"daily_injection": arrays[i][8]
				});
				water += parseFloat(arrays[i][5]);
				injection += parseFloat(arrays[i][7]);
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
					"title": (daily ? "Daily Oil / " : "Monthly Oil / ") + (water ? "Water " : "Injection ") + (metric ? "(m3)" : "(bbl)"),
					"titleColor": "green",
					"treatZeroAs": log ? 0.0001 : 0,
					"position": "left"
    }, {
					"id": "v2",
					"axisColor": "red",
					"axisAlpha": 1,
					"logarithmic": log,
					"precision": 2,
					"title": (daily ? "Daily Gas " : "Monthly Gas ") + (metric ? "(e3m3)" : "(mcf)"),
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
					"title": daily ? "Daily Oil" : "Monthly Oil",
					"useLineColorForBulletBorder": true,
					"valueAxis": "v1",
					"valueField": daily ? "daily_oil" : "oil"
    }, {
					"bullet": "round",
					"connect": false,
					"bulletBorderAlpha": 1,
					"bulletColor": "white",
					"bulletSize": 4,
					"hideBulletsCount": 50,
					"lineColor": "red",
					"lineThickness": 2,
					"title": daily ? "Daily Gas" : "Monthly Gas",
					"useLineColorForBulletBorder": true,
					"valueAxis": "v2",
					"valueField": daily ? "daily_gas" : "gas"
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
				g.title = daily ? "Daily Water" : "Monthly Water";
				g.useLineColorForBulletBorder = true;
				g.valueAxis = "v1";
				g.valueField = daily ? "daily_water" : "water";
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
				g.title = daily ? "Daily Injection" : "Monthly Injection";
				g.useLineColorForBulletBorder = true;
				g.valueAxis = "v1";
				g.valueField = daily ? "daily_injection" : "injection";
				chart.addGraph(g);
			};
		};
	};



	// 100/02-34-018-16W4/00
	$("#log, #daily").change(function () {
		drawChartProduction(tableProduction, $("#log").is(":checked"), $("#daily").is(":checked"), $("#metric").is(":checked"));
	});


	$("#daily-table").change(function () {
		tableProduction.columns([1, 3, 5, 7]).visible(!this.checked);
		tableProduction.columns([2, 4, 6, 8]).visible(this.checked);
	});

});

	