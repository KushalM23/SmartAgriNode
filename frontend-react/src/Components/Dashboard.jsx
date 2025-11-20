import React, { useState } from 'react';
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
            formatter: function () {
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
        formatter: function (val) {
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
    <div className="w-full p-8 bg-[#f8f9fa]">
      <h1 className="text-[#333] text-[2rem] font-semibold mb-6 tracking-tighter text-center">Smart Farm Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 p-4">
        <div className="bg-white rounded-xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200 ease-out text-center min-h-[320px] flex flex-col relative overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_15px_rgba(224,23,9,0.08)] bg-gradient-to-br from-white to-[#f8f9fa] row-span-1">
          <h3 className="text-[#E01709] mb-6 text-[1.2rem] font-semibold tracking-tighter">Climate Conditions</h3>
          <div className="inline-flex items-center gap-0 p-1 bg-[#f8f9fa] border border-[#e9ecef] rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
              className={`flex-1 px-[18px] py-[10px] border-0 bg-transparent text-[#6c757d] cursor-pointer text-[0.9rem] font-medium rounded-lg transition-all duration-300 ease-out relative text-center hover:bg-[rgba(224,23,9,0.05)] hover:text-[#E01709] ${activeTab === 'temperature' ? '!bg-[#E01709] !text-white !font-semibold shadow-[0_2px_8px_rgba(224,23,9,0.3)]' : ''}`}
              onClick={() => setActiveTab('temperature')}
            >
              Temperature
            </button>
            <button
              className={`flex-1 px-[18px] py-[10px] border-0 bg-transparent text-[#6c757d] cursor-pointer text-[0.9rem] font-medium rounded-lg transition-all duration-300 ease-out relative text-center hover:bg-[rgba(224,23,9,0.05)] hover:text-[#E01709] ${activeTab === 'humidity' ? '!bg-[#E01709] !text-white !font-semibold shadow-[0_2px_8px_rgba(224,23,9,0.3)]' : ''}`}
              onClick={() => setActiveTab('humidity')}
            >
              Humidity
            </button>
            <button
              className={`flex-1 px-[18px] py-[10px] border-0 bg-transparent text-[#6c757d] cursor-pointer text-[0.9rem] font-medium rounded-lg transition-all duration-300 ease-out relative text-center hover:bg-[rgba(224,23,9,0.05)] hover:text-[#E01709] ${activeTab === 'rainfall' ? '!bg-[#E01709] !text-white !font-semibold shadow-[0_2px_8px_rgba(224,23,9,0.3)]' : ''}`}
              onClick={() => setActiveTab('rainfall')}
            >
              Rainfall
            </button>
          </div>
          <div className="flex-1 flex justify-center items-center mt-4">
            {activeTab === 'temperature' && (
              <div className="flex flex-col items-center h-full">
                <ReactApexChart
                  options={tempGaugeOptions}
                  series={tempGaugeSeries}
                  type="radialBar"
                />
              </div>
            )}
            {activeTab === 'humidity' && (
              <div className="flex flex-col items-center h-full">
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
                            formatter: function () {
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
              <div className="flex flex-col items-center h-full">
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
                            formatter: function () {
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

        <div className="bg-white rounded-xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200 ease-out text-center min-h-[320px] flex flex-col relative overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_15px_rgba(224,23,9,0.08)] bg-gradient-to-br from-white to-[#f8f9fa] row-span-1 items-center justify-between">
          <h3 className="text-[#E01709] mb-6 text-[1.2rem] font-semibold tracking-tighter">Soil pH</h3>
          <ReactApexChart
            options={phChartOptions}
            series={phChartSeries}
            type="line"
          />
          <div className="text-[#666] text-[0.95rem] mt-auto font-medium">Current: {farmData.pH} pH</div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200 ease-out text-center min-h-[320px] flex flex-col relative overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_15px_rgba(224,23,9,0.08)] bg-gradient-to-br from-white to-[#f8f9fa] md:col-span-2">
          <h3 className="text-[#E01709] mb-6 text-[1.2rem] font-semibold tracking-tighter">NPK Values</h3>
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