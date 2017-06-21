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
        bottom:20,
        right: '5%',
        left: '5%',
      },
      tooltip: {
        formatter: function (params) {
          //params = params[0];
          var date = new Date(params.name);
          return params.value[0].slice(11, 19) + '<br/>' + params.value[1];
        },
        axisPointer: {
          type: 'none',
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        scale: true,
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        axisLabel: {
          textStyle: {
            color: 'black'
          }
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 0.05,
        scale: true,
        axisLine: {
          show: false,
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        axisLabel: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 97,
          end: 100
        },
        /*{
          start: 97,
          end: 100
        }*/
      ],
      series: [{
        name: 'ticks',
        type: 'line',
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: true,
        animation: false,
        hoverAnimation: false,
        lineStyle: {
          normal: {
            color: '#7cb5ec'
          }
        },
        itemStyle: {
          normal: {
            color: '#7cb5ec'
          }
        }
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
        factory.contracts = [];
      }

      if(options && typeof options === 'object'){
        if(options.series && options.series.length > 0){

          if(options.series[0].data || Array.isArray(options.series[0].data)){
            ticks = options.series[0].data;
          }

          if(ticks.length > 0){
            ticks[ticks.length - 1].label = {
              normal: {
                show: false
              }
            }
          }

          ticks = ticks.concat(data);

          ticks[ticks.length - 1].label = {
            normal: {
              show: true,
              offset: [-5, 0],
              position: 'insideRight',
              textStyle: {
                color: '#2E8836'
              }
            }
          }

          /*markLine.data.push( {
            yAxis: ticks[ticks.length - 1].value[1],
            symbol: 'circle'
          });*/


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

    factory.destroy = function(){
      factory.chart.clear();
      factory.chart.dispose();
      factory.contracts = null;
    }


    return factory;


  }
})();
