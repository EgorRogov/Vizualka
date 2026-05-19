import React, { useState } from 'react';
import { Coords } from '../types';

interface CitySearchProps {
  onCitySelect: (coords: Coords) => void;
  apiKey: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect, apiKey }) => {
  const [cityName, setCityName] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
    );
    const data = await response.json();

    onCitySelect({
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name,
    });
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Введите город..."
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        style={{ padding: '8px', marginRight: '10px' }}
      />
      <button type="submit" style={{ padding: '8px 12px' }}>Найти</button>
    </form>
  );
};