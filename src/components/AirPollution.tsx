import React from 'react';
import { AirPollutionInfo } from '../types';

interface AirPollutionProps {
  data: AirPollutionInfo | null;
}

export const AirPollution: React.FC<AirPollutionProps> = ({ data }) => {
  if (!data || !data.list || data.list.length === 0) return null;

  const index = data.list[0]?.main?.aqi || 0;
  
  const getAirQualityText = (level: number) => {
    switch (level) {
      case 1: return 'Отличное';
      case 2: return 'Хорошее';
      case 3: return 'Умеренное';
      case 4: return 'Плохое';
      case 5: return 'Очень плохое';
      default: return 'Нет данных';
    }
  };

  return (
    <div style={{
      marginTop: '15px',
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    }}>
      <h4>Качество воздуха: {getAirQualityText(index)}</h4>
    </div>
  );
};