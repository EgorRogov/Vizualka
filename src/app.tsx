import { useState, useEffect } from 'react';
import { CitySearch } from './components/CitySearch';
import { WeatherCard } from './components/WeatherCard';
import { AirPollution } from './components/AirPollution';
import { Coords, WeatherItem, AirPollutionInfo } from './types';

const API_KEY = '6e0d90fd445c084af7da1d7263f8770a';
const THREE_HOURS = 3 * 60 * 60 * 1000;

const WEATHER_BACKGROUNDS: Record<string, string> = {
  Clear: '#FFF9C4',
  Clouds: '#CFD8DC',
  Rain: '#90CAF9',
  Drizzle: '#B0BEC5',
  Snow: '#E0F7FA',
  Thunderstorm: '#78909C',
  Default: '#F5F5F5'
};

export default function App() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [forecast, setForecast] = useState<WeatherItem[]>([]);
  const [pollution, setPollution] = useState<AirPollutionInfo | null>(null);

  const fetchAllData = async (lat: number, lon: number) => {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
    );
    const weatherData = await weatherRes.json();
    setForecast(weatherData.list || []);

    const pollutionRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const pollutionData = await pollutionRes.json();
    setPollution(pollutionData);
  };

  useEffect(() => {
    if (!coords) {
      return;
    }

    fetchAllData(coords.lat, coords.lon);

    const interval = setInterval(() => {
      fetchAllData(coords.lat, coords.lon);
    }, THREE_HOURS);

    return () => {
      clearInterval(interval);
    };
  }, [coords]);

  const getBackgroundColor = () => {
    if (forecast.length === 0) {
      return WEATHER_BACKGROUNDS.Default;
    }
    const currentWeather = forecast[0]!.weather[0]?.main || 'Unknown';
    return WEATHER_BACKGROUNDS[currentWeather] || WEATHER_BACKGROUNDS.Default;
  };

  return (
    <div style={{
      backgroundColor: getBackgroundColor(),
      minHeight: '100vh',
      padding: '20px',
      transition: 'background-color 0.5s ease'
    }}>
      <h1>Прогноз погоды</h1>
      
      <CitySearch onCitySelect={setCoords} apiKey={API_KEY} />

      {coords && (
        <div>
          <h2>Погода в городе: {coords.name}</h2>
          
          {pollution && <AirPollution data={pollution} />}

          <h3>Прогноз на 3 дня:</h3>
          <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '10px' }}>
            {forecast.slice(0, 24).map((item) => (
              <WeatherCard key={item.dt} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}