import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../Context/ThemeContext';
import { useAuth } from '../Context/AuthContext';
import { useWeather } from '../Context/WeatherContext';
import { api } from '../lib/api';

const SOIL_DATA = {
  pH: 6.9,
  nitrogen: 136.0,
  phosphorus: 36.0,
  potassium: 20.0
};

const getPhStatus = (ph) => {
  if (ph < 6.0) return 'Acidic';
  if (ph > 7.5) return 'Alkaline';
  return 'Neutral';
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('temperature');
  const [activeSoilTab, setActiveSoilTab] = useState('ph');
  const { theme } = useTheme();
  const { session } = useAuth();
  const { weatherData } = useWeather();
  const [soilData, setSoilData] = useState(SOIL_DATA);
  const [loading, setLoading] = useState(false);

  // Add refs to track mounting and polling
  const isMounted = React.useRef(true);
  const pollInterval = React.useRef(null);

  // Define the fetch function outside useEffect
  const fetchSensorData = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    
    // Clear any existing interval to prevent duplicates
    if (pollInterval.current) clearInterval(pollInterval.current);

    try {
      setLoading(true);
      // 1. Trigger measurement
      await api.triggerSensorMeasurement(session.access_token);
      
      // 2. Poll for results
      pollInterval.current = setInterval(async () => {
        if (!isMounted.current) return;
        try {
          const res = await api.getLatestSensors(session.access_token);
          if (res.status === 'complete' && res.data) {
            clearInterval(pollInterval.current);
            setSoilData({
              pH: parseFloat(res.data.ph.toFixed(1)),
              nitrogen: parseFloat(res.data.N.toFixed(1)),
              phosphorus: parseFloat(res.data.P.toFixed(1)),
              potassium: parseFloat(res.data.K.toFixed(1))
            });
            setLoading(false);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);

      // Stop polling after 30 seconds
      setTimeout(() => {
          if (pollInterval.current) clearInterval(pollInterval.current);
          if(isMounted.current) setLoading(false);
      }, 30000);
      
    } catch (e) {
      console.error("Failed to trigger sensors", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [session]);

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
    data: [soilData.nitrogen, soilData.phosphorus, soilData.potassium]
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

  const phStatus = getPhStatus(soilData.pH);

  return (
    <div className="page-container dashboard-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">Fetching Sensor Data...</div>
        </div>
      )}
      
      {/* Updated Header with Button */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, textAlign: 'left' }}>Smart Farm Dashboard</h1>
        <button className="fetch-btn" onClick={fetchSensorData} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>

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
              <div className="ph-display">
                <div className="ph-circle">
                  <div className="ph-value">{soilData.pH.toFixed(1)}</div>
                  <div className="ph-label">pH Level</div>
                </div>
                <div className="ph-status">
                  {phStatus}
                </div>
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
