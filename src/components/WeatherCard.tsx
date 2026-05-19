import React from 'react';
import { WeatherItem } from '../types';

interface WeatherCardProps {
  item: WeatherItem;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ item }) => {
  const weather = item.weather[0] || { icon: '', description: '' };
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  const date = new Date(item.dt_txt).toLocaleString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '8px',
      padding: '10px',
      margin: '5px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      textAlign: 'center',
      minWidth: '120px'
    }}>
      <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{date}</p>
      
      <img src={iconUrl} alt={weather.description} title={weather.description} />
      
      <p style={{ fontSize: '18px', margin: '5px 0' }}>{Math.round(item.main.temp)}°C</p>
      <p style={{ fontSize: '12px', margin: '5px 0' }}>{weather.description}</p>
    </div>
  );
};