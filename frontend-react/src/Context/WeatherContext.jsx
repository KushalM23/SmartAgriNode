import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWeatherApi } from 'openmeteo';

const WeatherContext = createContext();

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

export function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(INITIAL_WEATHER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const latitude = Number(import.meta.env?.VITE_OPEN_METEO_LAT) || DEFAULT_COORDS.latitude;
        const longitude = Number(import.meta.env?.VITE_OPEN_METEO_LON) || DEFAULT_COORDS.longitude;

        const responses = await fetchWeatherApi(OPEN_METEO_URL, {
          ...WEATHER_PARAMS,
          latitude,
          longitude
        });

        const response = responses[0];
        if (!response) return;

        const current = response.current();
        if (!current) return;

        const getVariableValue = (index) => {
            try {
                const variable = current.variables(index);
                return typeof variable?.value === 'function' ? variable.value() : undefined;
            } catch (error) {
                return undefined;
            }
        };

        const precipitation = getVariableValue(0);
        const temperature = getVariableValue(1);
        const humidity = getVariableValue(2);

        setWeatherData(prev => ({
          temperature: typeof temperature === 'number' ? Number(temperature.toFixed(2)) : prev.temperature,
          humidity: typeof humidity === 'number' ? Number(humidity.toFixed(2)) : prev.humidity,
          rainfall: typeof precipitation === 'number' ? Number(precipitation.toFixed(2)) : prev.rainfall
        }));
      } catch (error) {
        console.error('Unable to load Open-Meteo weather data', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
    // Refresh every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WeatherContext.Provider value={{ weatherData, loading }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
