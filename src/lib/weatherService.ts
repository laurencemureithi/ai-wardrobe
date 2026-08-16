import type { WeatherData } from '@/lib/types';

const MOCK_WEATHER: WeatherData = {
  temperature: 22,
  condition: 'Partly cloudy',
  rain: false,
  humidity: 55,
  wind: 12,
  location: 'London',
};

export async function getWeather(_location?: string): Promise<WeatherData> {
  // Phase 2: integrate real weather API
  return Promise.resolve({ ...MOCK_WEATHER, location: _location ?? MOCK_WEATHER.location });
}

export function weatherIcon(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('rain')) return 'rain';
  if (c.includes('cloud')) return 'cloud';
  if (c.includes('sun') || c.includes('clear')) return 'sun';
  if (c.includes('snow')) return 'snow';
  return 'cloud';
}
