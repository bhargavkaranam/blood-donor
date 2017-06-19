"use strict"
var app = angular.module('phive');

app.factory('getChart', ['dateRange', function (dateRange) {
    // Setting default colors to chart, TODO: move this to any global config
    Chart.defaults.global.colours = ["#777777", "#02ceff", "#fd586f", "#A70219", "#d9534f", "#24282f", "#0219A7"];
    var getChartData = function (chartData, fromDate, toDate, imprintType) {

        var labels = [];
        var data = [];
        var date, dateFormat, index;
        var mlist = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var sRange, totalCount, outerType, innerType, l = 0;

        if (typeof imprintType === 'object') {
            outerType = Object.keys(imprintType)[0] || '';
            innerType = Object.keys(imprintType[outerType])[0] || '';
          //  console.log('outer obj ' + outerType);
        }

        // update the total count
        if (chartData && typeof (chartData) === 'object') {
            if (chartData.hasOwnProperty('total')) {
                if (typeof imprintType === 'object') {
                    totalCount = chartData.total[outerType][innerType] || 0;
                } else {
                    totalCount = chartData.total[imprintType] || 0;
                }
            }
        }

        var dataKeys = Object.keys(chartData);

        for (var i = 0; i < dataKeys.length; i++) {

            // strip $, lastUpdated and total
            if (dataKeys[i].startsWith('$') || dataKeys[i].startsWith('lastUpdated') || dataKeys[i].startsWith('total')) {
                index = dataKeys.indexOf(dataKeys[i]);
                dataKeys.splice(index, 1);
                i--;
            } else {
                // label data
                // minify data on x axis
                sRange = dateRange.getSpaceLimit(dataKeys.length);
                if (l == 0) {
                    l = sRange;
                }

                if (l == sRange) {
                    date = new Date(parseInt(dataKeys[i]));
                    dateFormat = date.getDate() + ' ' + mlist[date.getMonth()];
                    labels.push(dateFormat);
                    l--;
                } else {
                    labels.push("");
                    l--;
                }

                //data
              //  console.log(chartData[dataKeys[i]]);
                if (typeof chartData[dataKeys[i]] == "object") {
                    if (typeof imprintType === 'object') {
                        if(chartData[dataKeys[i]].hasOwnProperty(outerType)) {
                            if(chartData[dataKeys[i]][outerType].hasOwnProperty(innerType)) {
                                data.push(chartData[dataKeys[i]][outerType][innerType]);
                            } else {
                                 data.push(0);   // later added                                  
                            }
                        } else {
                            data.push(0);   // later added  
                        }
                    } else if (chartData[dataKeys[i]].hasOwnProperty(imprintType)) {
                        data.push(chartData[dataKeys[i]][imprintType]);
                    } else {
                        data.push(0);
                    }
                } else {
                    data.push(0);
                }
            }
        }

      //  console.log('chart data ' + chartData, labels, data);
        return {
            labels: labels,
            data: data,
            totalCount: totalCount
        }

    }
    return {
        getChartData: getChartData
    }

}]);


