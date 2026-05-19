export interface Coords {
  lat: number;
  lon: number;
  name: string;
}

export interface WeatherItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    feels_like: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
}

export interface AirPollutionInfo {
  list: {
    main: {
      aqi: number; 
    };
  }[];
}