import React, { useState } from 'react';
import './Dashboard.css';
import ReactApexChart from 'react-apexcharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('temperature');

  const sharedGradient = {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'horizontal',
      shadeIntensity: 0.15,
      gradientToColors: ['#ff8f89'],
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100],
      colorStops: [
        {
          offset: 0,
          color: '#E01709',
          opacity: 1
        },
        {
          offset: 100,
          color: '#ff8f89',
          opacity: 0.8
        }
      ]
    }
  };
  // Example data - replace with actual API data later
  const farmData = {
    temperature: 23.09,
    humidity: 84.86,
    rainfall: 71.29,
    pH: 6.92,
    nitrogen: 136,
    phosphorus: 36,
    potassium: 20
  };

  // NPK Bar Chart Config
  const npkChartOptions = {
    chart: {
      type: 'bar',
      height: 200,
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '65%',
        distributed: true
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        colors: ['#fff']
      }
    },
    colors: ['#E01709'],
    xaxis: {
      categories: ['Nitrogen', 'Phosphorus', 'Potassium'],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: { text: 'Value' },
      min: 0,
      max: 200,
      tickAmount: 5
    },
    grid: {
      borderColor: '#f1f1f1'
    },
    legend: {
      show: false
    }
  };

  const npkChartSeries = [{
    name: 'NPK Values',
    data: [farmData.nitrogen, farmData.phosphorus, farmData.potassium]
  }];

  // Temperature Gauge Config
  const tempGaugeOptions = {
    chart: {
      type: 'radialBar',
      height: 200,
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '75%',
          background: '#fff',
          dropShadow: {
            enabled: true,
            opacity: 0.1
          }
        },
        track: {
          background: '#f1f1f1',
          strokeWidth: '100%',
          dropShadow: {
            enabled: true,
            opacity: 0.1
          }
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            color: '#666',
            offsetY: 20
          },
          value: {
            show: true,
            fontSize: '24px',
            color: '#E01709',
            offsetY: -20,
            formatter: function() {
              return farmData.temperature.toFixed(1) + '°C';
            }
          }
        }
      }
    },
    fill: { ...sharedGradient },
    stroke: {
      lineCap: 'round'
    },
    labels: ['Temperature']
  };

  const tempGaugeSeries = [Math.min(Math.max((farmData.temperature / 45) * 100, 0), 100)];

  // pH Level Chart Config
  const phChartOptions = {
    chart: {
      type: 'line',
      height: 200,
      toolbar: { show: false },
      background: 'transparent',
      animations: {
        enabled: false
      }
    },
    stroke: {
      show: true,
      curve: 'straight',
      width: 2,
      colors: ['#E01709']
    },
    markers: {
      size: 5,
      colors: ['#E01709'],
      strokeWidth: 0,
      hover: {
        size: 7
      }
    },
    grid: {
      show: true,
      borderColor: '#f1f1f1',
      strokeDashArray: 3,
      position: 'back',
      padding: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 40
      },
      xaxis: {
        lines: { show: false }
      }
    },
    yaxis: {
      min: 4,
      max: 9,
      tickAmount: 5,
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px'
        },
        formatter: (value) => value.toFixed(1)
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px'
        }
      }
    },
    annotations: {
      yaxis: []
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function(val) {
          return val.toFixed(1) + ' pH';
        }
      }
    }
  };

  // pH data with more realistic weekly trend
  const phChartSeries = [{
    name: 'pH Level',
    type: 'line',
    data: [6.3, 6.5, 6.7, farmData.pH, 6.6, 6.4, 6.5].map(val => parseFloat(val.toFixed(1))),
  }];

  return (
    <div className="page-container dashboard-container">
      <h1>Smart Farm Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card metrics-card">
          <h3>Climate Conditions</h3>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'temperature' ? 'active' : ''}`}
              onClick={() => setActiveTab('temperature')}
            >
              Temperature
            </button>
            <button 
              className={`tab ${activeTab === 'humidity' ? 'active' : ''}`}
              onClick={() => setActiveTab('humidity')}
            >
              Humidity
            </button>
            <button 
              className={`tab ${activeTab === 'rainfall' ? 'active' : ''}`}
              onClick={() => setActiveTab('rainfall')}
            >
              Rainfall
            </button>
          </div>
          <div className="metrics-content">
            {activeTab === 'temperature' && (
              <div className="circular-progress">
                <ReactApexChart 
                  options={tempGaugeOptions} 
                  series={tempGaugeSeries} 
                  type="radialBar" 
                />
              </div>
            )}
            {activeTab === 'humidity' && (
              <div className="circular-progress">
                <ReactApexChart
                  options={{
                    ...tempGaugeOptions,
                    labels: ['Humidity'],
                    fill: { ...sharedGradient },
                    plotOptions: {
                      ...tempGaugeOptions.plotOptions,
                      radialBar: {
                        ...tempGaugeOptions.plotOptions.radialBar,
                        dataLabels: {
                          ...tempGaugeOptions.plotOptions.radialBar.dataLabels,
                          value: {
                            ...tempGaugeOptions.plotOptions.radialBar.dataLabels.value,
                            color: '#E01709',
                            formatter: function() {
                              return farmData.humidity + '%';
                            }
                          }
                        }
                      }
                    }
                  }}
                  series={[farmData.humidity]}
                  type="radialBar"
                />
              </div>
            )}
            {activeTab === 'rainfall' && (
              <div className="circular-progress">
                <ReactApexChart
                  options={{
                    ...tempGaugeOptions,
                    labels: ['Rainfall'],
                    fill: { ...sharedGradient },
                    plotOptions: {
                      ...tempGaugeOptions.plotOptions,
                      radialBar: {
                        ...tempGaugeOptions.plotOptions.radialBar,
                        dataLabels: {
                          ...tempGaugeOptions.plotOptions.radialBar.dataLabels,
                          value: {
                            ...tempGaugeOptions.plotOptions.radialBar.dataLabels.value,
                            color: '#E01709',
                            formatter: function() {
                              return farmData.rainfall + ' mm';
                            }
                          }
                        }
                      }
                    }
                  }}
                  series={[Math.min(farmData.rainfall * 10, 100)]}
                  type="radialBar"
                />
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card ph-card">
          <h3>Soil pH</h3>
          <ReactApexChart 
            options={phChartOptions} 
            series={phChartSeries} 
            type="line" 
          />
          <div className="data-label">Current: {farmData.pH} pH</div>
        </div>

        <div className="dashboard-card npk-card">
          <h3>NPK Values</h3>
          <ReactApexChart 
            options={npkChartOptions} 
            series={npkChartSeries} 
            type="bar" 
          />
        </div>
      </div>
    </div>
  );
}