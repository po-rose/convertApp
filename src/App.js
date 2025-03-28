import './App.css';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts'; //
import React, { useEffect, useState } from 'react';
import { HLTrend } from './indicators/HLTrend';
import { generateMomentumSignals } from './indicators/MomentumOscillator';
import { generateSupportResistance } from './indicators//SupportResistanceClouds.js';

import { HLCAreaSeries } from './hlc-area-series/hlc-area-series.ts';
import { HLAreaSeries } from './hl-area-series/hl-area-series.ts';
import { HLLineSeries } from './hl-line-series/hl-line-series.ts';
import { CloudAreaSeries } from './cloud-area-series/cloud-area-series.ts';
import { getOHLCData } from './utils/getOHLCData.js';

function App() {
  const [dataDataOHLC, setDataOHLC] = useState([]);
  const [interval, setInterval] = useState('5m');
  const [selectedIndicator, setSelectedIndicator] = useState('1');
  const [tokenAddress, setTokenAddress] = useState("BQX1cjcRHXmrqNtoFWwmE5bZj7RPneTmqXB979b2pump");
  const [inputToken, setInputToken] = useState("BQX1cjcRHXmrqNtoFWwmE5bZj7RPneTmqXB979b2pump");
  const [pairAddress, setPairAddress] = useState("2baC5JL75NosEr2oLJZ14gbNjWDuUq3ui33ZPLZTgCEA")
  //9fmdkQipJK2teeUv53BMDXi52uRLbrEvV38K8GBNkiM7
  //CniPCE4b3s8gSUPhUiyMjXnytrEqUrMfSsnbBjLCpump
  const [isRealTime, setIsRealTime] = useState(false)
  const [isShow, setIsShow] = useState({
    volume: false,
    indicator: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const indicatorOptions = [
    { value: '1', label: 'H&L Moving Average' },
    { value: '2', label: 'Momentum Oscillator' },
    { value: '3', label: 'Support/Resistance Clouds' },
    { value: '4', label: 'All' },
  ]
  const intervals = ['1s', '5s', '15s', '30s', '1m', '5m', '30m', '1h', '4h']

  // Get Data from Pumpfun
  const getData = async (isAdd) => {
    if (!isAdd) setIsLoading(true);
    try {
      const data = await getOHLCData(pairAddress, interval, isAdd);
      if (data) {
        if (!isAdd) {
          setDataOHLC(data);
          console.log(dataDataOHLC);
        } else {
          if (data.length > 0) {
            if (dataDataOHLC[dataDataOHLC.length - 1].time < data[0].time) {
              const newData = {
                time: data[0].time,
                open: dataDataOHLC[dataDataOHLC.length - 1].close,
                high: data[0].high,
                low: data[0].low,
                close: data[0].close
              }
              setDataOHLC(dataDataOHLC.concat(newData));
            }
          }
        }
      }
      setIsLoading(false);
      setIsRealTime(!isRealTime);
    } catch (error) {
      console.error('Error getting OHLC data:', error);
    }
  };

  const drawIndicator1 = (chart) => {
    if (dataDataOHLC.length < 36) {
      alert("The data length is small");
      // toggleIsShow('indicator');
    }
    const hlData = HLTrend(dataDataOHLC);
    const customSeriesViewList = new HLCAreaSeries();
    const hlcChart = chart.addCustomSeries(customSeriesViewList, {
      highLineColor: 'rgba(0, 0, 0, 0)',
      lowLineColor: 'rgba(0, 0, 0, 0)',
      closeLineColor: 'rgba(128, 128, 0, 0.2)',
      areaBottomColor: 'rgba(128, 128, 0, 0.2)',
      areaTopColor: 'rgba(128, 128, 0, 0.2)',
      highLineWidth: 0,
      lowLineWidth: 0,
      closeLineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    hlcChart.setData(hlData);
  }

  const drawIndicator2 = (chart) => {
    if (dataDataOHLC.length < 168) {
      alert("The data length is small.");
      // toggleIsShow('indicator');
    }
    const closeData = dataDataOHLC.map((item) => item.close);
    const timeData = dataDataOHLC.map((item) => item.time);
    const momentumData = generateMomentumSignals(closeData);
    const customSeriesView = new HLAreaSeries();
    const seriesChart = chart.addCustomSeries(customSeriesView, {
      highLineColor: '#D1D4DC',
      lowLineColor: '#D1D4DC',
      highLineWidth: 1,
      lowLineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false
    }, 1);
    const dataList = [];
    for (let i = 168; i < timeData.length; i++) {
      dataList.push({
        time: timeData[i],
        low: momentumData.lowerBand[i],
        high: momentumData.upperBand[i],
        color: 'rgba(0, 0, 0, 0.2)'
      })
    }
    seriesChart.setData(dataList);

    const dataListMomentum = [];
    for (let i = 168; i < timeData.length; i++) {
      dataListMomentum.push({
        time: timeData[i],
        value: momentumData.momentumValues[i],
        color: momentumData.color[i]
      })
    }
    const seriesChartMomentum = chart.addSeries(LineSeries, { color: 'teal' }, 1);
    seriesChartMomentum.setData(dataListMomentum);

    const lineSeriesView = new HLLineSeries();
    const lineChart = chart.addCustomSeries(lineSeriesView, {
      lineColor: 'rgba(0, 0, 0, 0)',
      lineWidth: 4,
      lastValueVisible: false,
      priceLineVisible: false
    }, 1);
    const dataListLine = [];
    for (let i = 168; i < timeData.length; i++) {
      dataListLine.push({
        time: timeData[i],
        value: momentumData.momentumValues[i],
        color: momentumData.color[i] === 'teal' ? 'rgba(0, 0, 0, 0)' : momentumData.color[i]
      })
    }
    lineChart.setData(dataListLine);
  }

  const drawIndicator3 = (chart) => {
    if (dataDataOHLC.length < 28) {
      alert("The data length is small");
      // toggleIsShow('indicator');
    }
    const chartData = generateSupportResistance(dataDataOHLC);
    const cloudSeriesView = new CloudAreaSeries();
    const cloudSeriesChart = chart.addCustomSeries(cloudSeriesView, {
      lineColor: '#444',
      topColor: 'rgba(242, 54, 69, 0.2)',
      mediumColor: 'rgba(4, 153, 129, 0.2)',
      lowColor: 'rgba(4, 153, 129, 0.2)',
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    cloudSeriesChart.setData(chartData);
  }
  // Add useEffect for interval changes
  useEffect(() => {
    getData(false);
  }, [interval, tokenAddress]);

  // Separate useEffect for chart rendering
  useEffect(() => {
    if (document.getElementById("container") === null) return;
    const handleResize = () => {
      chart.applyOptions({ width: document.getElementById("container").clientWidth });
    };
    const chartOptions = {
      layout: { textColor: 'white', background: { type: 'solid', color: '#1b1b1b' } },
      width: document.getElementById("container").clientWidth,
      grid: { vertLines: { color: '#444' }, horzLines: { color: '#444' } },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        visible: true,
        borderColor: '#D6DCDE',
        priceFormat: {
          type: 'custom',
          formatter: price => {
            return price.toFixed(9);
          },
          minMove: 0.000000001,
        },
      },
      crosshair: {
        horzLines: {
          visible: true,
          labelVisible: true,
        },
        vertLine: {
          visible: true,
          labelVisible: true,
        },
      },
      localization: {
        priceFormatter: price => price.toFixed(9),
      },
    };
    let chart = createChart(document.getElementById("container"), chartOptions);

    // Indicators
    if (isShow.indicator) {      
      switch (selectedIndicator) {
        case '1':
          drawIndicator1(chart);
          break;
        case '2':
          drawIndicator2(chart);
          break;
        case '3':
          drawIndicator3(chart);
          break;
        case '4':
          drawIndicator1(chart);
          drawIndicator2(chart);
          drawIndicator3(chart);
          break;
        default:
          console.warn('Selected indicator not implemented');
      }
    }

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    }, 0);
    candlestickSeries.setData(dataDataOHLC);

    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [dataDataOHLC, selectedIndicator, isShow]); // Update dependencies to include all used values

  useEffect(() => {
    let timerValue = parseInt(interval, 10);
    let timerUnit = interval.charAt(interval.length - 1);
    timerValue = timerUnit === 's' ? timerValue * 1000 : timerUnit === 'm' ? timerValue * 60000 : timerValue * 3600000;
    const timer = setTimeout(() => {
      getData(true);
    }, timerValue);
    return () => clearTimeout(timer); // Cleanup
  }, [isRealTime]);

  const toggleIsShow = (isShow) => {
    setIsShow(prev => ({
      ...prev,
      [isShow]: !prev[isShow]
    }));
  };

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${inputToken}`;
      fetch(url)
        .then((response) => response.text())
        .then((result) => {
          if (isShow.indicator) toggleIsShow('indicator');
          result = JSON.parse(result);
          result = result.pairs;
          const pairLists = result.map((item) => item.pairAddress)
          setTokenAddress(inputToken);
          setPairAddress(pairLists[0]);
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error('Error getting pair addresses:', error);
    }
  };

  return (
    <div className="App" >
      <div className="App-content">
        <div className='Chart-header'>
          <div className='Interval-container'>
            {
              intervals.map((item, index) => {
                return (
                  <button key={index} onClick={() => setInterval(item)} style={{ color: item === interval ? "#3d98ff" : "white", borderBottom: item === interval ? "1px solid #4ea9fd" : "1px solid #1b1b1b" }} className='Interval-button'>{item}</button>
                )
              })
            }
          </div>
          <div className='Token-input'>
            <form onSubmit={handleTokenSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Enter token mint address"
                className='input'
              />
              <button
                type="submit"
                className='button'
              >
                Search
              </button>
            </form>
          </div>
          <div className='Indicator-container'>
            {isShow.indicator && <div className='indicator-method'>
              <select
                className='indicator-select'
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
              >
                {indicatorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>}
            <div className='indicator-toggle'>
              <span className='indicator-label'>Indicator</span>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={isShow.indicator}
                  onChange={() => toggleIsShow('indicator')}
                />
                <span className='slider round'></span>
              </label>
            </div>
            {/* <div className='indicator-toggle'>
              <span className='indicator-label'>Volume</span>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={isShow.volume}
                  onChange={() => toggleIsShow('volume')}
                />
                <span className='slider round'></span>
              </label>
            </div> */}
          </div>
        </div>
        <div className="Chart-content">
          <div id='container' style={{ width: "100%", height: "100%" }} />
          {isLoading &&
            <div className='Loading-content'>
              <div className='Loading'>Loading</div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}


export default App;