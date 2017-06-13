/**
 * @name echart service
 * @author morteza tavnarad
 * @contributors []
 * @since 05/31/2017
 * @copyright binary ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.echart.services')
    .factory('chartService', Chart);

  Chart.$inject = [];

  function Chart(){
    var factory = {};

    var options = {
      title: {
        show: false
      },
      grid: {
        top: 5,
        bottom:70,
        left: '17%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          params = params[0];
          var date = new Date(params.name);
          return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 0.5,
        scale: true,
        axisLine: {
          show: false
        },
        axisLabel: {

        },
        splitLine: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 97,
          end: 100
        },
        {
          start: 97,
          end: 100
        }
      ],
      series: [{
        name: 'ticks',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
      }],
      useUTC: true
    };

    factory.init = function(chartDOM){
      factory.chart = echarts.init(chartDOM);
      factory.chart.setOption(options, true);
    };

    factory.addHistory = function(history){
      var data = [];

      history.times.forEach((time, index) => {
        var timeString = new Date(time * 1000).toISOString();
        data.push({
          name: timeString,
          value:[
            timeString,
            history.prices[index]
          ]
        });
      });

      updateDataSeries(data, true)

    };

    factory.addTick = function(tick) {
      var timeString = new Date(tick.epoch * 1000).toISOString();
      var data = {
        name: timeString,
        value: [
          timeString,
          tick.quote
        ]
      };

      updateDataSeries(data);
    }

    factory.addContract = function(contract){
      factory.contracts.push(contractService.init(contract));
    }

    function updateDataSeries(data, notMerge){
      var options = factory.chart.getOption();
      var ticks = [];

      if(notMerge){
        options.series[0].data = [];
      }

      if(options && typeof options === 'object'){
        if(options.series && options.series.length > 0){

          if(options.series[0].data || Array.isArray(options.series[0].data)){
            ticks = options.series[0].data;
          }

          ticks = ticks.concat(data);


          factory.chart.setOption({
            series: [
                {
                  markLine: {
                    silent: true,
                    label: {
                      normal: {
                        position: 'start',
                        textStyle: {
                          fontWeight: 'bolder'
                        }
                      }
                    },
                    data: [
                      {
                        yAxis: ticks[ticks.length - 1].value[1]
                      }
                    ]
                  },
                  data: ticks
                }
            ]
          });
        }
      }
    };


    return factory;


  }
})();
