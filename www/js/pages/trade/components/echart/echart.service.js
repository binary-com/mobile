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

  Chart.$inject = ['contractService'];

  function Chart(contractService){
    var factory = {};
    factory.contracts = [];

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
      var contractRegions = [];
      var contractBarriers = [];
      var data = {
        name: timeString,
        value: [
          timeString,
          tick.quote
        ]
      };


      if(!_.isEmpty(factory.contracts)){
        factory.contracts.forEach((contract)=> {
          if(!contract.isFinished()){
            contract.addSpot(tick);
            var barrierLine = contract.getBarrierLine();
            if(!_.isEmpty(barrierLine)){
              contractBarriers.push(barrierLine);
            }
          }
          var region = contract.getRegion();
          if(!_.isEmpty(region)){
            contractRegions.push(region);
          }
        });
      }

      updateDataSeries(data, false, contractRegions, contractBarriers);
    }

    factory.addContract = function(contract){
      factory.contracts.push(contractService.init(contract));
    }

    function updateDataSeries(data, notMerge, regions, barriers){
      var options = factory.chart.getOption();
      var ticks = [];
      var markLine = {
        silent: true,
        symbol: ['none', 'none'],
        label: {
          normal: {
            position: 'start',
            textStyle: {
              fontWeight: 'bolder'
            }
          }
        },
        data: []
      };

      if(!_.isEmpty(barriers)){
        markLine.data = markLine.data.concat(barriers);
      }

      if(notMerge){
        options.series[0].data = [];
      }

      if(options && typeof options === 'object'){
        if(options.series && options.series.length > 0){

          if(options.series[0].data || Array.isArray(options.series[0].data)){
            ticks = options.series[0].data;
          }

          ticks = ticks.concat(data);
          markLine.data.push( {
            yAxis: ticks[ticks.length - 1].value[1],
            symbol: 'circle'
          });


          factory.chart.setOption({
            series: [
                {
                  markLine: markLine,
                  markArea: {
                    silent: true,
                    data: regions
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
