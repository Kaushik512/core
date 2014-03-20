//Flot Chart Dynamic Chart

$(function () {
 try { 
    var container = $("#flot-chart-moving-line");

    // Determine how many data points to keep based on the placeholder's initial size;
    // this gives us a nice high-res plot while avoiding more than one point per pixel.

    var maximum = container.outerWidth() / 2 || 300;

    //

    var data = [];

    function getRandomData() {

        if (data.length) {
            data = data.slice(1);
        }

        while (data.length < maximum) {
            var previous = data.length ? data[data.length - 1] : 50;
            var y = previous + Math.random() * 10 - 5;
            data.push(y < 0 ? 0 : y > 100 ? 100 : y);
        }

        // zip the generated y values with the x values

       
        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }

        return res;
    }

    //

    series = [{
        data: getRandomData(),
        lines: {
            fill: true
        }
    }];

    //

    var plot = $.plot(container, series, {
        grid: {
            borderWidth: 1,
            minBorderMargin: 20,
            labelMargin: 10,
            backgroundColor: {
                colors: ["#fff", "#e4f4f4"]
            },
            margin: {
                top: 8,
                bottom: 20,
                left: 20
            },
            markings: function (axes) {
                var markings = [];
                var xaxis = axes.xaxis;
                for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
                    markings.push({ xaxis: { from: x, to: x + xaxis.tickSize }, color: "rgba(232, 232, 255, 0.2)" });
                }
                return markings;
            }
        },
        xaxis: {

            tickFormatter: function () {
                return "";


            }
        },
        yaxis: {
            min: 0,
            max: 110
        },
        legend: {
            show: true
        }
    });

    // Update the random dataset at 25FPS for a smoothly-animating chart

    setInterval(function updateRandom() {
        series[0].data = getRandomData();
        plot.setData(series);
        plot.draw();
    }, 40);
}catch(error){
    
}

});


//Flot Line Chart with Tooltips
$(document).ready(function () {
    try {
        console.log("document ready");
        var offset = 0;

        function plot1() {
            var sin = [], cos = [];
            for (var i = 0; i < 12; i += 0.2) {
                sin.push([i, Math.sin(i + offset)]);
                cos.push([i, Math.cos(i + offset)]);
            }

            var options = {
                series: {
                    lines: { show: true },
                    points: { show: true }
                },
                grid: {
                    hoverable: true //IMPORTANT! this is needed for tooltip to work
                },
                yaxis: { min: -1.2, max: 1.2 },
                tooltip: true,
                tooltipOpts: {
                    content: "'%s' of %x.1 is %y.4",
                    shifts: {
                        x: -60,
                        y: 25
                    }
                }
            };

            var plotObj = $.plot($("#flot-chart-line"),
			[{ data: sin, label: "Data" }, { data: cos, label: "Users"}],
			options);
        } plot1();
    } catch (error) {

    }

});





/*Server Load */


//Flot Chart Dynamic Chart
 


var container = $("#flot-chart-server");

// Determine how many data points to keep based on the placeholder's initial size;
// this gives us a nice high-res plot while avoiding more than one point per pixel.

var maximum = container.outerWidth() / 10 || 300;

//

var data = [];

function getRandomData() {

    if (data.length) {
        data = data.slice(1);
    }

    while (data.length < maximum) {
        var previous = data.length ? data[data.length - 1] : 50;
        var y = previous + Math.random() * 10 - 5;
        data.push(y < 0 ? 0 : y > 100 ? 100 : y);
    }

    // zip the generated y values with the x values

    var res = [];
    for (var i = 0; i < data.length; ++i) {
        res.push([i, data[i]])
    }

    return res;
}
//

series = [{
    data: getRandomData(),
    lines: {
        fill: true,
        fillColor: "rgba(255,255,255,0.4)"
   }
    }];

//

try {
var plot = $.plot(container, series, {
    grid: {
        borderWidth: 0,
        minBorderMargin: 10,
        labelMargin: 10,
        backgroundColor: {
            colors: ["rgba(255, 255, 255,0)", "rgba(255, 255, 255,0)"]
        },
        margin: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        markings: function(axes) {
            var markings = [];
            var xaxis = axes.xaxis;
            for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
                markings.push({
                    xaxis: {
                        from: x,
                        to: x + xaxis.tickSize
                    },
                    color: "rgba(255, 255, 255, 0)"
                });
            }
            return markings;
        }
    },
    xaxis: {
        tickFormatter: function() {
            return "";
        }
    },
    yaxis: {
        min: 10,
        max: 110,
        show: false
    },
    legend: {
        show: false
    },
    colors: ["#fff"]

});


// Update the random dataset at 25FPS for a smoothly-animating chart

setInterval(function updateRandom() {
    series[0].data = getRandomData();
    plot.setData(series);
    plot.draw();
}, 500);
} catch (err){
    
    
} 

//Flot Pie Chart with Tooltips

   /* 
$(function () {
    var data = [
		{ label: "Series 0", data: 1 },
		{ label: "Series 1", data: 3 },
		{ label: "Series 2", data: 9 },
		{ label: "Series 3", data: 20 }
	];

    var plotObj = $.plot($("#flot-chart-pie"), data, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});

*/