import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import ReactApexChart from 'react-apexcharts';
import History from './History';
import { useTheme } from '../Context/ThemeContext';
import { fetchWeatherApi } from 'openmeteo';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_PARAMS = {
  hourly: ['temperature_2m', 'relative_humidity_2m'],
  current: ['precipitation', 'temperature_2m', 'relative_humidity_2m'],
  timezone: 'auto'
};

const DEFAULT_COORDS = {
  latitude: 12.9719,
  longitude: 77.5937
};

const INITIAL_WEATHER = {
  temperature: 23.09,
  humidity: 84.86,
  rainfall: 71.29
};

const SOIL_DATA = {
  pH: 6.92,
  nitrogen: 136,
  phosphorus: 36,
  potassium: 20
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('temperature');
  const [activeSoilTab, setActiveSoilTab] = useState('ph');
  const { theme } = useTheme();
  const [weatherData, setWeatherData] = useState(INITIAL_WEATHER);

  useEffect(() => {
    let isMounted = true;

    const parseCoordinate = (value, fallback) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const loadWeather = async () => {
      try {
        const latitude = parseCoordinate(import.meta.env?.VITE_OPEN_METEO_LAT, DEFAULT_COORDS.latitude);
        const longitude = parseCoordinate(import.meta.env?.VITE_OPEN_METEO_LON, DEFAULT_COORDS.longitude);

        const responses = await fetchWeatherApi(OPEN_METEO_URL, {
          ...WEATHER_PARAMS,
          latitude,
          longitude
        });

        const response = responses[0];
        if (!response) {
          return;
        }

        const current = response.current();
        if (!current || typeof current.variables !== 'function') {
          return;
        }

        const getVariableValue = (index) => {
          try {
            const variable = current.variables(index);
            return typeof variable?.value === 'function' ? variable.value() : undefined;
          } catch (error) {
            console.error('Failed to read Open-Meteo variable', error);
            return undefined;
          }
        };

        const precipitation = getVariableValue(0);
        const temperature = getVariableValue(1);
        const humidity = getVariableValue(2);

        if (isMounted) {
          setWeatherData((prev) => ({
            temperature: typeof temperature === 'number' ? Number(temperature.toFixed(2)) : prev.temperature,
            humidity: typeof humidity === 'number' ? Number(humidity.toFixed(2)) : prev.humidity,
            rainfall: typeof precipitation === 'number' ? Number(precipitation.toFixed(2)) : prev.rainfall
          }));
        }
      } catch (error) {
        console.error('Unable to load Open-Meteo weather data', error);
      }
    };

    // Pull live weather metrics once on mount.
    loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  const sharedGradient = {
    type: 'gradient',
    gradient: {
      shade: theme === 'dark' ? 'dark' : 'light',
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
          color: 'var(--primary-color)',
          opacity: 1
        },
        {
          offset: 100,
          color: 'var(--primary-color)',
          opacity: 1
        }
      ]
    }
  };

  // NPK Bar Chart Config
  const npkChartOptions = {
    chart: {
      type: 'bar',
      height: 200,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: 'var(--text-color)'
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        columnWidth: '65%',
        distributed: true
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 250
        },
        plotOptions: {
          bar: {
            columnWidth: '50%',
            borderRadius: 4
          }
        },
        xaxis: {
          labels: {
            rotate: -45,
            style: {
              fontSize: '10px'
            },
            trim: false,
            hideOverlappingLabels: false
          }
        }
      }
    }],
    dataLabels: {
      enabled: false,
      style: {
        fontSize: '14px',
        colors: ['#fff']
      }
    },
    colors: ['var(--primary-color)'],
    xaxis: {
      categories: ['Nitrogen', 'Phosphorus', 'Potassium'],
      labels: {
        style: {
          fontSize: '12px',
          colors: 'var(--text-color)'
        }
      },
      axisBorder: {
        show: true,
        color: 'var(--input-border)'
      },
      axisTicks: {
        show: true,
        color: 'var(--input-border)'
      }
    },
    yaxis: {
      title: { text: 'Value' },
      min: 0,
      max: 200,
      tickAmount: 5,
      labels: {
        style: {
          colors: 'var(--text-color)'
        }
      }
    },
    grid: {
      borderColor: 'var(--input-border)'
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: theme,
      style: {
        fontSize: '12px'
      },
      onDatasetHover: {
        highlightDataSeries: true
      },
      x: {
        show: true,
        format: 'dd MMM'
      },
      marker: {
        show: true
      },
      items: {
        display: 'flex'
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0
      }
    }
  };

  const npkChartSeries = [{
    name: 'NPK Values',
    data: [SOIL_DATA.nitrogen, SOIL_DATA.phosphorus, SOIL_DATA.potassium]
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
          background: 'var(--card-bg)',
          dropShadow: {
            enabled: true,
            opacity: 0.1
          }
        },
        track: {
          background: 'var(--input-border)',
          strokeWidth: '100%',
          dropShadow: {
            enabled: true,
            opacity: 0.1
          }
        },
        dataLabels: {
          show: true,
          name: {
            show: false,
            fontSize: '14px',
            color: 'var(--text-color)',
            offsetY: 20
          },
          value: {
            show: true,
            fontSize: '24px',
            color: 'var(--text-color)',
            offsetY: 0,
            formatter: function () {
              return weatherData.temperature.toFixed(1) + '°C';
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

  const tempGaugeSeries = [Math.min(Math.max((weatherData.temperature / 45) * 100, 0), 100)];

  // pH Level Chart Config
  const phChartOptions = {
    chart: {
      type: 'line',
      height: 200,
      toolbar: { show: false },
      background: 'transparent',
      animations: {
        enabled: false
      },
      foreColor: 'var(--text-color)'
    },
    colors: ['var(--text-color)'],
    stroke: {
      show: true,
      curve: 'straight',
      width: 2,
      colors: ['var(--text-color)']
    },
    markers: {
      size: 5,
      colors: ['var(--primary-color)'],
      strokeWidth: 0,
      hover: {
        size: 7
      }
    },
    grid: {
      show: true,
      borderColor: 'var(--input-border)',
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
          colors: 'var(--text-color)',
          fontSize: '12px'
        },
        formatter: (value) => value.toFixed(1)
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: {
          colors: 'var(--text-color)',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: true,
        color: 'var(--input-border)'
      },
      axisTicks: {
        show: true,
        color: 'var(--input-border)'
      }
    },
    annotations: {
      yaxis: []
    },
    tooltip: {
      theme: theme,
      y: {
        formatter: function (val) {
          return val.toFixed(1) + ' pH';
        }
      }
    }
  };

  const phChartSeries = [{
    name: 'pH Level',
    type: 'line',
    data: [6.3, 5.3, 6.7, SOIL_DATA.pH, 6.6, 6.4, 7.2].map(val => parseFloat(val.toFixed(1))),
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
                            color: 'var(--text-color)',
                            formatter: function () {
                              return weatherData.humidity.toFixed(1) + '%';
                            }
                          }
                        }
                      }
                    }
                  }}
                  series={[Math.min(Math.max(weatherData.humidity, 0), 100)]}
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
                            color: 'var(--text-color)',
                            formatter: function () {
                              return weatherData.rainfall.toFixed(1) + ' mm';
                            }
                          }
                        }
                      }
                    }
                  }}
                  series={[Math.min(weatherData.rainfall * 10, 100)]}
                  type="radialBar"
                />
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card soil-card">
          <h3>Soil Health</h3>
          <div className="tabs">
            <button
              className={`tab ${activeSoilTab === 'ph' ? 'active' : ''}`}
              onClick={() => setActiveSoilTab('ph')}
            >
              Soil pH
            </button>
            <button
              className={`tab ${activeSoilTab === 'npk' ? 'active' : ''}`}
              onClick={() => setActiveSoilTab('npk')}
            >
              NPK Values
            </button>
          </div>
          <div className="metrics-content">
            {activeSoilTab === 'ph' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ReactApexChart
                  options={phChartOptions}
                  series={phChartSeries}
                  type="line"
                  height="200"
                />
                <div className="data-label">Current: {SOIL_DATA.pH} pH</div>
              </div>
            )}
            {activeSoilTab === 'npk' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ReactApexChart
                  options={npkChartOptions}
                  series={npkChartSeries}
                  type="bar"
                  height="200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
