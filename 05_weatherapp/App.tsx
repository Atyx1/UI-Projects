import React, { useState, useEffect, useRef, useCallback } from "react";

// Dynamically load CDNs for Tailwind and Material Icons
const TW_CDN_URL =
  "https://cdn.tailwindcss.com?plugins=forms,typography&min=3.4.4";
const MATERIAL_ICONS_CDN_URL =
  "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";

// Type Definitions - Simplified for Template
type View = "Home" | "Weather" | "Settings";

// Weather-related type definitions
type WeatherData = {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    time: string; // ISO 8601 format string
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  timezone: string;
  latitude: number;
  longitude: number;
};

type GeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

// Weather Token Type
type WeatherToken = "clear" | "cloudy" | "rain" | "snow" | "storm" | "fog";

// Capital city type
type Capital = {
  name: string;
  lat: number;
  lon: number;
};

// Capital weather data type
type CapitalWeather = {
  city: string;
  temperature: number;
  weatherCode: number;
  tempMin: number;
  tempMax: number;
};

// Fixed list of world capitals
const capitals: Capital[] = [
  { name: "Londra", lat: 51.5074, lon: -0.1278 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Kahire", lat: 30.0444, lon: 31.2357 },
  { name: "Rio", lat: -22.9068, lon: -43.1729 },
  { name: "Singapur", lat: 1.3521, lon: 103.8198 },
];

// Color palette for Tailwind Config
const tailwindConfig = `
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Vibrant Blue Tone)
        brand: {
          light: '#f0f9ff', // sky-50
          DEFAULT: '#0ea5e9', // sky-500
          dark: '#0369a1',  // sky-700
          'text-light': '#f8fafc', // neutral-50 (For light theme text)
          'text-dark': '#0f172a',  // neutral-900 (For dark theme text)
        },
        // Secondary Accent Colors (Vibrant Green Tone)
        secondary: {
          light: '#a7f3d0', // emerald-200
          DEFAULT: '#10b981', // emerald-500
          dark: '#047857',  // emerald-700
        },
        // Tertiary/Action Color (Vibrant Rose Tone)
        accent: {
          light: '#ffe4e6', // rose-100
          DEFAULT: '#f43f5e', // rose-500
          dark: '#be123c',  // rose-700
        },
        // Neutral Colors (Gray Tones) - Slightly darker for contrast
        neutral: {
          50: '#f9fafb',  // gray-50
          100: '#f3f4f6', // gray-100
          200: '#e5e7eb', // gray-200
          300: '#d1d5db', // gray-300
          400: '#9ca3af', // gray-400
          500: '#6b7280', // gray-500
          600: '#4b5563', // gray-600
          700: '#374151', // gray-700
          800: '#1f2937', // gray-800
          900: '#111827', // gray-900
          950: '#030712', // gray-950
        },
        // Status Colors
        success: '#10b981', // emerald-500
        error: '#f43f5e',   // rose-500
        info: '#3b82f6',   // blue-500
        // Weather Colors for icons etc. (distinct from background)
        'weather': {
          'sunny': '#FFB74D', // amber-400
          'cloudy': '#78909C', // blueGray-400
          'rainy': '#42A5F5', // blue-400
          'snowy': '#E1F5FE', // lightBlue-50
          'thunderstorm': '#5C6BC0', // indigo-400
          'foggy': '#B0BEC5' // blueGray-200
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      },
      boxShadow: {
        'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'smooth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'smooth-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-smooth': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
        'button': '0 2px 5px 0 rgba(0, 0, 0, 0.08)',
        'button-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      },
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'star-twinkle': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-down': {
          'from': { transform: 'translateY(-100%)' },
          'to': { transform: 'translateY(0)' }
        },
        'slide-out-up': {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-100%)' }
        },
        'slide-in-up': {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' }
        },
        'slide-out-down': {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(100%)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'bounce-light': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'rotate-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        'ping-small': {
          '75%, 100%': { transform: 'scale(1.1)', opacity: '0' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' }
        },
        'heatmap-pulse': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s infinite ease-in-out',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'gradient-shift': 'gradient-shift 30s ease infinite',
        'star-twinkle': 'star-twinkle 5s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-down': 'slide-in-down 0.3s ease-out forwards',
        'slide-out-up': 'slide-out-up 0.3s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.3s ease-out forwards',
        'slide-out-down': 'slide-out-down 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'bounce-light': 'bounce-light 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 8s linear infinite',
        'ping-small': 'ping-small 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'heatmap-pulse': 'heatmap-pulse 3s infinite ease-in-out'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'background': 'background-image, background-color',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            h1: {
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            },
            h2: {
              fontSize: 'clamp(1.25rem, 4vw, 2rem)',
            },
            h3: {
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            },
          },
        },
      },
    }
  }
}
`;

// Toast notification type
type ToastState = {
  message: string;
  type: "success" | "error" | "info";
};

let showToast: (
  message: string,
  type?: "success" | "error" | "info"
) => void = () => {};

// --- Helper Functions ---

// Check if it's night based on local time (approximated)
const isNight = (timeStr: string, timezone: string): boolean => {
  try {
    // Use Intl.DateTimeFormat to get the local hour in the specified timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false, // Use 24-hour format
      timeZone: timezone,
    });
    const date = new Date(timeStr);
    const hour = parseInt(formatter.format(date), 10);

    // Consider night to be roughly 7 PM to 6 AM
    return hour >= 19 || hour < 6;
  } catch (e) {
    console.error("Error determining night time:", e);
    // Fallback: use client's local time if timezone fails
    const hour = new Date().getHours();
    return hour >= 19 || hour < 6;
  }
};

// Convert WMO weather code to simplified token
const getWeatherToken = (weatherCode: number): WeatherToken => {
  // Clear sky, mainly clear
  if (weatherCode === 0 || weatherCode === 1) return "clear";

  // Partly cloudy, overcast
  if (weatherCode === 2 || weatherCode === 3) return "cloudy";

  // Fog, depositing rime fog
  if (weatherCode === 45 || weatherCode === 48) return "fog";

  // Rain, drizzle, light/moderate/heavy rain
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return "rain";

  // Snow, freezing rain/drizzle
  if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(weatherCode))
    return "snow";

  // Thunderstorm
  if ([95, 96, 99].includes(weatherCode)) return "storm";

  // Default fallback
  return "clear";
};

// Get weather icon and description based on WMO code
const getWeatherInfo = (code: number) => {
  const codeMap: {
    [key: number]: { icon: string; description: string; color: string };
  } = {
    0: { icon: "wb_sunny", description: "Clear sky", color: "weather-sunny" },
    1: {
      icon: "partly_cloudy_day",
      description: "Mainly clear",
      color: "weather-sunny",
    },
    2: {
      icon: "partly_cloudy_day",
      description: "Partly cloudy",
      color: "weather-cloudy",
    },
    3: { icon: "cloud", description: "Overcast", color: "weather-cloudy" },
    45: { icon: "cloud", description: "Fog", color: "weather-foggy" },
    48: {
      icon: "cloud",
      description: "Depositing rime fog",
      color: "weather-foggy",
    },
    51: { icon: "grain", description: "Light drizzle", color: "weather-rainy" },
    53: {
      icon: "grain",
      description: "Moderate drizzle",
      color: "weather-rainy",
    },
    55: { icon: "grain", description: "Dense drizzle", color: "weather-rainy" },
    56: {
      icon: "ac_unit",
      description: "Light freezing drizzle",
      color: "weather-snowy",
    },
    57: {
      icon: "ac_unit",
      description: "Dense freezing drizzle",
      color: "weather-snowy",
    },
    61: {
      icon: "water_drop",
      description: "Slight rain",
      color: "weather-rainy",
    },
    63: {
      icon: "water_drop",
      description: "Moderate rain",
      color: "weather-rainy",
    },
    65: {
      icon: "water_drop",
      description: "Heavy rain",
      color: "weather-rainy",
    },
    66: {
      icon: "ac_unit",
      description: "Light freezing rain",
      color: "weather-snowy",
    },
    67: {
      icon: "ac_unit",
      description: "Heavy freezing rain",
      color: "weather-snowy",
    },
    71: {
      icon: "ac_unit",
      description: "Slight snow fall",
      color: "weather-snowy",
    },
    73: {
      icon: "ac_unit",
      description: "Moderate snow fall",
      color: "weather-snowy",
    },
    75: {
      icon: "ac_unit",
      description: "Heavy snow fall",
      color: "weather-snowy",
    },
    77: { icon: "ac_unit", description: "Snow grains", color: "weather-snowy" },
    80: {
      icon: "water_drop",
      description: "Slight rain showers",
      color: "weather-rainy",
    },
    81: {
      icon: "water_drop",
      description: "Moderate rain showers",
      color: "weather-rainy",
    },
    82: {
      icon: "water_drop",
      description: "Violent rain showers",
      color: "weather-rainy",
    },
    85: {
      icon: "ac_unit",
      description: "Slight snow showers",
      color: "weather-snowy",
    },
    86: {
      icon: "ac_unit",
      description: "Heavy snow showers",
      color: "weather-snowy",
    },
    95: {
      icon: "thunderstorm",
      description: "Thunderstorm",
      color: "weather-thunderstorm",
    },
    96: {
      icon: "thunderstorm",
      description: "Thunderstorm with slight hail",
      color: "weather-thunderstorm",
    },
    99: {
      icon: "thunderstorm",
      description: "Thunderstorm with heavy hail",
      color: "weather-thunderstorm",
    },
  };
  return (
    codeMap[code] || {
      icon: "help_outline",
      description: "Unknown",
      color: "neutral-500",
    }
  );
};

// --- Dynamic Background Component ---

// Define gradient backgrounds for each weather token + day/night combination
const skyGradients = {
  // Professional Fortune 500 style gradients with better readability
  clearDay: "linear-gradient(to bottom, #E3F2FD, #BBDEFB, #90CAF9)", // Soft light blue gradients
  clearNight: "linear-gradient(to bottom, #1A237E, #283593, #303F9F)", // Muted navy blue
  cloudyDay: "linear-gradient(to bottom, #ECEFF1, #CFD8DC, #B0BEC5)", // Light gray with subtle blue tint
  cloudyNight: "linear-gradient(to bottom, #263238, #37474F, #455A64)", // Dark blue-gray
  rainDay: "linear-gradient(to bottom, #B3E5FC, #81D4FA, #4FC3F7)", // Soft blue for better text contrast
  rainNight: "linear-gradient(to bottom, #1A237E, #1565C0, #0D47A1)", // Dark muted blue
  snowDay: "linear-gradient(to bottom, #E1F5FE, #B3E5FC, #81D4FA)", // Very light blue
  snowNight: "linear-gradient(to bottom, #1A237E, #0D47A1, #01579B)", // Navy with royal blue
  stormDay: "linear-gradient(to bottom, #78909C, #607D8B, #546E7A)", // Blue-gray for stormy look
  stormNight: "linear-gradient(to bottom, #263238, #263238, #37474F)", // Very dark blue-gray
  fogDay: "linear-gradient(to bottom, #ECEFF1, #CFD8DC, #B0BEC5)", // Light gray with subtle warmth
  fogNight: "linear-gradient(to bottom, #37474F, #455A64, #546E7A)", // Medium-dark blue-gray
};

// Weather-specific SVG definitions
const rainSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="rainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
      <stop offset="100%" stop-color="rgba(176,219,252,0.5)"/>
    </linearGradient>
    <symbol id="raindrop" viewBox="0 0 10 20">
      <path d="M5,0 Q10,10 5,20 Q0,10 5,0 Z" fill="url(#rainGradient)" />
    </symbol>
  </defs>
  ${Array.from({ length: 40 })
    .map(
      () => `
    <use xlink:href="#raindrop" x="${Math.random() * 100}%" y="${
        -Math.random() * 50
      }%" 
    width="3" height="10" 
    style="opacity: ${Math.random() * 0.3 + 0.3}; animation: rain-fall ${
        Math.random() * 1 + 1.5
      }s linear ${Math.random() * 2}s infinite;" />
  `
    )
    .join("")}
</svg>
`;

const snowSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="snowGradient">
      <stop offset="0%" stop-color="white" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.6"/>
    </radialGradient>
    <symbol id="snowflake" viewBox="0 0 10 10">
      <circle cx="5" cy="5" r="4" fill="url(#snowGradient)" />
    </symbol>
  </defs>
  ${Array.from({ length: 60 })
    .map(
      () => `
    <use xlink:href="#snowflake" x="${Math.random() * 100}%" y="${
        -Math.random() * 50
      }%" 
    width="${Math.random() * 3 + 2}" height="${Math.random() * 3 + 2}" 
    style="opacity: ${Math.random() * 0.3 + 0.4}; animation: snow-fall ${
        Math.random() * 5 + 8
      }s linear ${Math.random() * 3}s infinite, snow-sway ${
        Math.random() * 3 + 3
      }s ease-in-out infinite;" />
  `
    )
    .join("")}
</svg>
`;

const cloudsSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="cloudBlur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
    </filter>
    <linearGradient id="cloudGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.75)"/>
      <stop offset="100%" stop-color="rgba(240,240,255,0.65)"/>
    </linearGradient>
    <linearGradient id="cloudGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(140,140,160,0.65)"/>
      <stop offset="100%" stop-color="rgba(90,90,110,0.55)"/>
    </linearGradient>
    <symbol id="cloud" viewBox="0 0 100 50">
      <path d="M10,30 Q20,10 40,20 Q50,5 70,20 Q90,15 90,30 Q100,40 85,45 Q80,60 65,50 Q50,65 35,50 Q20,60 15,45 Q0,40 10,30 Z" filter="url(#cloudBlur)" />
    </symbol>
  </defs>
  ${Array.from({ length: 4 })
    .map(
      (_, i) => `
    <use xlink:href="#cloud" x="${Math.random() * 100 - 50}%" y="${
        Math.random() * 30
      }%" 
    width="${Math.random() * 160 + 160}" height="${Math.random() * 60 + 60}" 
    fill="${
      i % 2 === 0 ? "url(#cloudGradientLight)" : "url(#cloudGradientDark)"
    }"
    style="opacity: ${Math.random() * 0.2 + 0.4}; animation: cloud-drift ${
        Math.random() * 120 + 60
      }s linear ${Math.random() * 10}s infinite;" />
  `
    )
    .join("")}
</svg>
`;

const fogSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="fogBlur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
    </filter>
    <linearGradient id="fogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.6)"/>
      <stop offset="100%" stop-color="rgba(240,240,255,0.4)"/>
    </linearGradient>
  </defs>
  ${Array.from({ length: 3 })
    .map(
      (_, i) => `
    <rect x="${-10 + i * 20}%" y="${30 + i * 15}%" width="120%" height="25%" 
    fill="url(#fogGradient)" filter="url(#fogBlur)"
    style="opacity: ${0.2 + i * 0.1}; animation: fog-drift ${
        40 + i * 20
      }s linear ${i * 5}s infinite alternate;" />
  `
    )
    .join("")}
</svg>
`;

const sunRaysSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="sunGlow" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="rgba(255,235,125,0.65)"/>
      <stop offset="40%" stop-color="rgba(255,200,65,0.4)"/>
      <stop offset="100%" stop-color="rgba(255,170,50,0)"/>
    </radialGradient>
  </defs>
  <ellipse cx="50%" cy="-5%" rx="60%" ry="30%" fill="url(#sunGlow)" style="animation: sun-pulse 5s ease-in-out infinite alternate;"/>
</svg>
`;

const stormSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
    </filter>
    <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,200,0.8)"/>
      <stop offset="100%" stop-color="rgba(255,220,110,0.6)"/>
    </linearGradient>
  </defs>
  ${Array.from({ length: 3 })
    .map(
      (_, i) => `
    <path d="M${50 + (Math.random() * 40 - 20)},0 
             L${40 + (Math.random() * 20 - 10)},${40 + Math.random() * 10} 
             L${50 + (Math.random() * 20 - 10)},${45 + Math.random() * 10} 
             L${30 + (Math.random() * 20 - 10)},${100 + Math.random() * 20}Z" 
          fill="url(#lightningGradient)" filter="url(#glow)" 
          style="opacity: 0; animation: lightning-flash 10s ${
            i * 3
          }s infinite;" />
  `
    )
    .join("")}
  ${rainSVG}
</svg>
`;

// Star field SVG definition - enhanced for clearer stars
const starSVG = `
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="blurFilter">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
    </filter>
    <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="white" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <symbol id="star" viewBox="0 0 2 2">
      <circle cx="1" cy="1" r="0.7" fill="url(#starGradient)" filter="url(#blurFilter)"/>
    </symbol>
    <radialGradient id="bigStarGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFDD" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#FFFFDD" stop-opacity="0"/>
    </radialGradient>
    <symbol id="bigStar" viewBox="0 0 4 4">
      <circle cx="2" cy="2" r="1.2" fill="url(#bigStarGradient)" filter="url(#blurFilter)"/>
    </symbol>
  </defs>
  ${Array.from({ length: 80 })
    .map(
      (_, i) => `
    <use xlink:href="${i % 20 === 0 ? "#bigStar" : "#star"}" x="${
        Math.random() * 100
      }%" y="${Math.random() * 100}%" width="${
        Math.random() * 2 + (i % 20 === 0 ? 3 : 1)
      }" height="${
        Math.random() * 2 + (i % 20 === 0 ? 3 : 1)
      }" style="animation: star-twinkle ${
        Math.random() * 5 + 3
      }s ease-in-out infinite alternate; animation-delay: ${
        Math.random() * 5
      }s;" />
  `
    )
    .join("")}
</svg>
`;

// Encode SVGs to base64
const starFieldBase64 = `data:image/svg+xml;base64,${btoa(starSVG)}`;
const rainBase64 = `data:image/svg+xml;base64,${btoa(rainSVG)}`;
const snowBase64 = `data:image/svg+xml;base64,${btoa(snowSVG)}`;
const cloudsBase64 = `data:image/svg+xml;base64,${btoa(cloudsSVG)}`;
const fogBase64 = `data:image/svg+xml;base64,${btoa(fogSVG)}`;
const sunRaysBase64 = `data:image/svg+xml;base64,${btoa(sunRaysSVG)}`;
const stormBase64 = `data:image/svg+xml;base64,${btoa(stormSVG)}`;

// Utility function for conditional class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Base64 encoded noise texture (1x1 pixel repeated)
const noiseTexture =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF62lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDYgNzkuZGFiYWNiYiwgMjAyMS8wNC8xNC0wMDozOTo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjQgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTAzLTI3VDE1OjQwOjAzKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wMy0yN1QxNTo0MDoyNyswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wMy0yN1QxNTo0MDoyNyswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIEVDIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmM0ZTc2Yjc2LTIxOGEtNDBkNi05MWZmLTg1ZmI0YTg1Zjk5OSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpjNGU3NmI3Ni0yMThhLTQwZDYtOTFmZi04NWZiNGE4NWY5OTkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjNGU3NmI3Ni0yMThhLTQwZDYtOTFmZi04NWZiNGE4NWY5OTkiPiA8ZGM6Y3JlYXRvcj4gPHJkZjpTZXE+IDxyZGY6bGk+R3JhaW4gVGV4dHVyZTwvcmRmOmxpPiA8L3JkZjpTZXE+IDwvZGM6Y3JlYXRvcj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjNGU3NmI3Ni0yMThhLTQwZDYtOTFmZi04NWZiNGE4NWY5OTkiIHN0RXZ0OndoZW49IjIwMjMtMDMtMjdUMTU6NDA6MDMrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi40IChNYWNpbnRvc2gpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpbUQhUAAADbSURBVGiB7dm9CsIwFAXgE6uIgvgADj6ci+jgILq5OvoAglPX7uJfoSI4uougOIhVcRFRcOlacnNuUrIeeO9wv5MhCU0pEQRBEARBEL4KAIyBDVM8GJq3hZMaWZL5w9QI5nYzL2wjJDGrhlYLqDEmSEyNoBd57pV444gDVsCiNPbZ4UVtZAmsyrxv/eBjA93jHaMu19Ss1BKHK7Cuyrd9XXyKQgD7vPYYuInTtbO1jzD41B4XYFvSjLaBUkCgHgXqxwD1w4j69Qn1CxX6Vw30L1HUr3TqX8b8ADXCJUcLLBF/AAAAAElFTkSuQmCC";

// Glass Card Component
const GlassCard: React.FC<
  React.ComponentProps<"div"> & {
    accent?: "sun" | "cloud" | "rain" | "snow" | "storm" | "fog";
    interactive?: boolean;
  }
> = ({
  accent = "sun",
  interactive = true,
  className = "",
  children,
  ...props
}) => {
  // Define accent colors
  const accentColors = {
    sun: "from-amber-300/20 dark:from-amber-500/20",
    cloud: "from-neutral-300/20 dark:from-neutral-500/20",
    rain: "from-blue-300/20 dark:from-blue-500/20",
    snow: "from-indigo-200/20 dark:from-indigo-500/20",
    storm: "from-purple-300/20 dark:from-purple-500/20",
    fog: "from-gray-300/20 dark:from-gray-500/20",
  };

  return (
    <div
      className={cn(
        // Base
        "rounded-2xl py-5 px-6 relative overflow-hidden",
        // Daha saydam görünüm için daha fazla bulanıklık
        "backdrop-blur-2xl backdrop-saturate-150 dark:backdrop-blur-2xl",
        // Daha saydam arka plan
        "bg-white/40 dark:bg-black/30",
        // Cam kenarı
        "border border-white/25 dark:border-white/15",
        // Daha modern gölge
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
        // Aksan gradyenti
        `bg-gradient-to-b ${accentColors[accent]} to-transparent`,
        // Etkileşimler (sadece interaktif ise)
        interactive
          ? "transition-all duration-150 hover:scale-[1.02] active:scale-95"
          : "",
        interactive
          ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          : "",
        className
      )}
      {...props}
    >
      {/* Gürültü katmanı */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url(${noiseTexture})`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Yumuşak iç ışıma */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />

      {/* Cam yansıması - üst kenar vurgusu */}
      <div className="absolute top-0 left-[5%] right-[5%] h-[1px] bg-white/30 dark:bg-white/15 pointer-events-none" />

      {/* İçerik */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const DynamicBackground: React.FC<{
  weatherCode: number | undefined;
  timeStr: string | undefined;
  timezone: string | undefined;
}> = ({ weatherCode, timeStr, timezone }) => {
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>(
    {}
  );
  const [showStars, setShowStars] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [showSnow, setShowSnow] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [showFog, setShowFog] = useState(false);
  const [showSunRays, setShowSunRays] = useState(false);
  const [showStorm, setShowStorm] = useState(false);

  // Reset all weather effect states
  const resetWeatherEffects = () => {
    setShowStars(false);
    setShowRain(false);
    setShowSnow(false);
    setShowClouds(false);
    setShowFog(false);
    setShowSunRays(false);
    setShowStorm(false);
  };

  useEffect(() => {
    if (weatherCode === undefined || !timeStr || !timezone) {
      // Default background if no weather data
      setBackgroundStyle({
        background: skyGradients.clearDay,
        backgroundSize: "200% 200%",
        animation: "gradient-shift 45s ease infinite",
      });
      resetWeatherEffects();
      return;
    }

    // Determine time of day
    const isDay = !isNight(timeStr, timezone);

    // Get simplified weather token
    const weatherToken = getWeatherToken(weatherCode);

    // Build key for gradient lookup
    const gradientKey = `${weatherToken}${
      isDay ? "Day" : "Night"
    }` as keyof typeof skyGradients;

    // Set the gradient based on weather and time
    setBackgroundStyle({
      background: skyGradients[gradientKey],
      backgroundSize: "200% 200%",
      animation: "gradient-shift 45s ease infinite",
    });

    // Reset all weather effects first
    resetWeatherEffects();

    // Enable specific effects based on weather
    switch (weatherToken) {
      case "clear":
        setShowStars(!isDay);
        if (isDay) setShowSunRays(true);
        break;
      case "cloudy":
        setShowClouds(true);
        break;
      case "rain":
        setShowClouds(true);
        setShowRain(true);
        break;
      case "snow":
        setShowClouds(true);
        setShowSnow(true);
        break;
      case "storm":
        setShowClouds(true);
        setShowStorm(true);
        break;
      case "fog":
        setShowFog(true);
        break;
      default:
        break;
    }
  }, [weatherCode, timeStr, timezone]);

  // Add CSS animations for weather effects
  useEffect(() => {
    // Add style element if not already present
    if (!document.getElementById("weather-animations")) {
      const styleEl = document.createElement("style");
      styleEl.id = "weather-animations";

      // Define animations for all weather effects
      styleEl.textContent = `
        @keyframes rain-fall {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(1000px); }
        }
        @keyframes snow-fall {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(1000px); }
        }
        @keyframes snow-sway {
          0% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          100% { transform: translateX(-5px); }
        }
        @keyframes cloud-drift {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fog-drift {
          0% { transform: translateX(-20%); }
          100% { transform: translateX(20%); }
        }
        @keyframes sun-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes lightning-flash {
          0%, 92%, 100% { opacity: 0; }
          93%, 95% { opacity: 0.8; }
        }
      `;

      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 transition-background duration-1000 ease-in-out overflow-hidden"
      style={backgroundStyle}
    >
      {/* Weather Effect Layers */}
      {showStars && (
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{ backgroundImage: `url("${starFieldBase64}")` }}
        />
      )}

      {showSunRays && (
        <div
          className="absolute inset-0 opacity-75 pointer-events-none"
          style={{ backgroundImage: `url("${sunRaysBase64}")` }}
        />
      )}

      {showClouds && (
        <div
          className="absolute inset-0 opacity-75 pointer-events-none"
          style={{ backgroundImage: `url("${cloudsBase64}")` }}
        />
      )}

      {showFog && (
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ backgroundImage: `url("${fogBase64}")` }}
        />
      )}

      {showRain && (
        <div
          className="absolute inset-0 opacity-75 pointer-events-none"
          style={{ backgroundImage: `url("${rainBase64}")` }}
        />
      )}

      {showSnow && (
        <div
          className="absolute inset-0 opacity-75 pointer-events-none"
          style={{ backgroundImage: `url("${snowBase64}")` }}
        />
      )}

      {showStorm && (
        <div
          className="absolute inset-0 opacity-75 pointer-events-none"
          style={{ backgroundImage: `url("${stormBase64}")` }}
        />
      )}

      {/* Content readability enhancement overlay */}
      <div
        className="absolute inset-0 pointer-events-none dark:bg-black/15 bg-white/10"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Text contrast enhancer for backgrounds */}
      <div className="absolute inset-0 pointer-events-none backdrop-brightness-[1.02] dark:backdrop-brightness-[0.98]" />
    </div>
  );
};

// --- Main App Component ---

function App() {
  // State management
  const [currentView, setCurrentView] = useState<View>("Home");
  const [darkMode, setDarkMode] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [fontSize, setFontSize] = useState(1);
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>(""); // Not currently used for display, but could be
  const [units, setUnits] = useState<"c" | "f">("c"); // "c" or "f"
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [capitalsWeather, setCapitalsWeather] = useState<CapitalWeather[]>([]);
  const [capitalsLoading, setCapitalsLoading] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [locationName, setLocationName] = useState<string>("");
  const [useMyLocation, setUseMyLocation] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  const scriptsLoaded = useRef(false);

  // Initialize toast notification system
  useEffect(() => {
    showToast = (message, type = "info") => {
      setToastState({ message, type });
      setTimeout(() => setToastState(null), 3000);
    };
  }, []);

  // Load CDNs & Initial Setup
  useEffect(() => {
    if (scriptsLoaded.current) return;

    const iconsLink = document.createElement("link");
    iconsLink.rel = "stylesheet";
    iconsLink.href = MATERIAL_ICONS_CDN_URL;
    document.head.appendChild(iconsLink);

    const twConfigScript = document.createElement("script");
    twConfigScript.innerHTML = tailwindConfig;
    twConfigScript.setAttribute("data-tailwind-config", "true");
    document.head.appendChild(twConfigScript);

    const twScript = document.createElement("script");
    twScript.src = TW_CDN_URL;
    twScript.async = true;
    twScript.onload = () => {
      console.log("Tailwind CDN loaded.");
      const savedMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedMode);
      // Set initial dark mode class before app renders fully
      document.documentElement.classList.toggle("dark", savedMode);
      setAppLoading(false); // App is ready after Tailwind loads
    };
    document.head.appendChild(twScript);

    scriptsLoaded.current = true;

    // Cleanup function
    return () => {
      // Check if elements exist before removing
      if (document.head.contains(iconsLink)) {
        document.head.removeChild(iconsLink);
      }
      const existingTwConfig = document.querySelector(
        "script[data-tailwind-config]"
      );
      if (existingTwConfig && document.head.contains(existingTwConfig)) {
        document.head.removeChild(existingTwConfig);
      }
      const existingTwScript = document.querySelector(
        `script[src="${TW_CDN_URL}"]`
      );
      if (existingTwScript && document.head.contains(existingTwScript)) {
        document.head.removeChild(existingTwScript);
      }
    };
  }, []);

  // Load/Save Dark Mode Preference
  useEffect(() => {
    // Load preference only once on initial mount after scripts are potentially loaded
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      const isDark = savedMode === "true";
      // Sync state only if necessary
      if (darkMode !== isDark) {
        setDarkMode(isDark);
      }
      // Always sync HTML class on load
      document.documentElement.classList.toggle("dark", isDark);
    } else {
      // Default to light mode if nothing is saved
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Save Dark Mode Preference whenever it changes (and app is not loading)
  useEffect(() => {
    if (!appLoading) {
      localStorage.setItem("darkMode", darkMode.toString());
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode, appLoading]);

  // Load/Save Font Size
  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      try {
        setFontSize(parseFloat(savedFontSize));
      } catch (error) {
        console.error("Error loading font size:", error);
        setFontSize(1); // Reset to default on error
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize.toString());
    // Apply font size directly to root element for global effect
    document.documentElement.style.fontSize = `${fontSize}rem`;
  }, [fontSize]);

  // Fetch weather data when the Weather view is active or initially if needed
  useEffect(() => {
    // Fetch initially or when switching to Weather view
    if (currentView === "Weather") {
      fetchWeatherData();
    }
    // Optionally fetch on initial load regardless of view
    // fetchWeatherData(); // Uncomment if weather needed globally/sooner
  }, [currentView]);

  // Weather data fetching function
  const fetchWeatherData = async () => {
    if (loading) return; // Prevent multiple fetches
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Get location name using reverse geocoding
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.address) {
            const city =
              geoData.address.city ||
              geoData.address.town ||
              geoData.address.village ||
              geoData.address.county ||
              "";
            const state = geoData.address.state || "";
            const country = geoData.address.country || "";

            let locationString = city;
            if (state && state !== city)
              locationString += state ? `, ${state}` : "";
            if (country)
              locationString += locationString ? `, ${country}` : country;

            setLocationName(locationString || "Unknown Location");
          }
        }
      } catch (geoErr) {
        console.error("Reverse geocoding error:", geoErr);
        setLocationName("Unknown Location");
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WeatherData = await response.json();

      // Basic validation of the received data structure
      if (
        !data ||
        !data.current ||
        !data.hourly ||
        !data.daily ||
        !data.timezone
      ) {
        throw new Error("Invalid weather data structure received.");
      }

      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Could not retrieve weather data");
      console.error("Weather fetch error:", err);
      setWeather(null); // Clear potentially stale weather data on error
    } finally {
      setLoading(false);
    }
  };

  // Helper function for getting current geolocation or defaulting
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        // Default to Istanbul if geolocation is unavailable
        return resolve({ coords: { latitude: 41.0082, longitude: 28.9784 } });
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.warn(`Geolocation error (${error.code}): ${error.message}`);
          // Default to Istanbul if permission denied or other errors
          resolve({ coords: { latitude: 41.0082, longitude: 28.9784 } });
        },
        { timeout: 10000 } // Add a timeout for the request
      );
    });
  };

  // Temperature conversion function
  const formatTemperature = (temp: number, unit: "c" | "f" = units): string => {
    let calculatedTemp = temp;
    if (unit === "f") {
      calculatedTemp = (temp * 9) / 5 + 32;
    }
    return `${Math.round(calculatedTemp)}°${unit.toUpperCase()}`;
  };

  // Format date functions
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        // timeZone: weather?.timezone // Optionally include timezone formatting
      }).format(date);
    } catch {
      return "Invalid Time";
    }
  };

  // Fetch weather data for a specific latitude/longitude
  const fetchWeatherForLocation = async (
    lat: number,
    lon: number
  ): Promise<CapitalWeather | null> => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Find the city name from capitals based on lat/lon
      const city =
        capitals.find(
          (capital) =>
            Math.abs(capital.lat - lat) < 0.1 &&
            Math.abs(capital.lon - lon) < 0.1
        )?.name || "Unknown";

      return {
        city,
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        tempMin: data.daily.temperature_2m_min[0],
        tempMax: data.daily.temperature_2m_max[0],
      };
    } catch (error) {
      console.error(
        `Error fetching weather for location ${lat},${lon}:`,
        error
      );
      return null;
    }
  };

  // Fetch weather for all capitals
  const fetchAllCapitalsWeather = async () => {
    setCapitalsLoading(true);
    try {
      const weatherPromises = capitals.map((capital) =>
        fetchWeatherForLocation(capital.lat, capital.lon)
      );

      const results = await Promise.all(weatherPromises);
      const validResults = results.filter(
        (result) => result !== null
      ) as CapitalWeather[];

      setCapitalsWeather(validResults);
    } catch (error) {
      console.error("Error fetching capitals weather:", error);
    } finally {
      setCapitalsLoading(false);
    }
  };

  // Fetch capital weather data on initial load
  useEffect(() => {
    fetchAllCapitalsWeather();
    // Refresh capitals weather every 15 minutes
    const intervalId = setInterval(fetchAllCapitalsWeather, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Scroll direction hook
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY + 10) {
      setScrollDirection("down");
    } else if (currentScrollY < lastScrollY - 10) {
      setScrollDirection("up");
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Weather recommendation based on weather token and temperature
  const getWeatherRecommendation = (
    weatherToken: WeatherToken,
    temperature: number
  ): string => {
    switch (weatherToken) {
      case "clear":
        if (temperature > 25)
          return "Don't forget to use sunscreen and stay hydrated. Great day for outdoor activities!";
        if (temperature < 10)
          return "Sunny but cold day. Keep yourself warm, a light jacket might be necessary.";
        return "Perfect weather! Ideal for spending time outdoors.";
      case "cloudy":
        if (temperature > 20)
          return "Cloudy but warm. Consider bringing an umbrella in case of sudden rain.";
        return "Cloudy day. Weather can be variable, layered clothing is recommended.";
      case "rain":
        if (temperature < 10)
          return "Cold and rainy. You'll need a waterproof jacket and boots.";
        return "Rainy day. We recommend an umbrella and waterproof shoes.";
      case "snow":
        return "Snowfall expected. Dress warmly and don't forget your gloves and boots.";
      case "storm":
        return "Storm warning! If possible, postpone going outside and stay safe at home.";
      case "fog":
        return "Foggy day. Be careful when driving, visibility is low.";
      default:
        return "Suitable weather for daily activities.";
    }
  };

  // Generate dummy weather details based on real weather
  const generateDummyWeatherDetails = (
    temperature: number,
    weatherCode: number
  ) => {
    const weatherToken = getWeatherToken(weatherCode);

    // Create somewhat realistic values based on actual temperature and weather
    const feelsLike =
      weatherToken === "rain"
        ? temperature - 2
        : weatherToken === "snow"
        ? temperature - 4
        : weatherToken === "clear" && temperature > 25
        ? temperature + 2
        : temperature;

    const humidity =
      weatherToken === "rain"
        ? Math.round(70 + Math.random() * 20)
        : weatherToken === "snow"
        ? Math.round(65 + Math.random() * 15)
        : weatherToken === "fog"
        ? Math.round(75 + Math.random() * 15)
        : Math.round(40 + Math.random() * 30);

    const visibility =
      weatherToken === "fog"
        ? Math.round(1 + Math.random() * 3)
        : weatherToken === "rain"
        ? Math.round(3 + Math.random() * 7)
        : weatherToken === "snow"
        ? Math.round(2 + Math.random() * 5)
        : Math.round(8 + Math.random() * 7);

    const pressure = Math.round(1000 + Math.random() * 30);

    const uvIndex =
      weatherToken === "clear"
        ? Math.round(6 + Math.random() * 5)
        : weatherToken === "cloudy"
        ? Math.round(3 + Math.random() * 3)
        : Math.round(1 + Math.random() * 2);

    const dewPoint = temperature - Math.round(3 + Math.random() * 5);

    return {
      feelsLike,
      humidity,
      visibility,
      pressure,
      uvIndex,
      dewPoint,
    };
  };

  // Location display component
  const LocationDisplay = () => {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <GlassCard className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-2xl text-brand">
                location_on
              </span>
              <div>
                <h4 className="text-lg font-semibold mb-1 text-neutral-900 dark:text-white">
                  {locationName || "Getting Location..."}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {weather
                    ? `${weather.latitude.toFixed(
                        2
                      )}°N, ${weather.longitude.toFixed(2)}°E`
                    : "..."}
                </p>
              </div>
            </div>
            <button
              onClick={fetchWeatherData}
              className="p-2 rounded-full bg-neutral-200/70 dark:bg-neutral-700/70 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/80 dark:hover:bg-neutral-600/80 transition-colors"
              aria-label="Update Location"
              title="Update Location"
            >
              <span className="material-icons-outlined text-xl">
                my_location
              </span>
            </button>
          </div>
        </GlassCard>
      </div>
    );
  };

  // Heatmap component for temperature visualization
  const HeatmapDisplay = () => {
    // Generate fake heatmap data
    const generateHeatmapData = () => {
      const width = 20;
      const height = 10;
      const data = [];

      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          // Create more realistic patterns - we'll use a combination of distance to center
          // and some wave patterns to simulate weather fronts
          const distToCenter = Math.sqrt(
            Math.pow((x - width / 2) / (width / 2), 2) +
              Math.pow((y - height / 2) / (height / 2), 2)
          );

          // Add wave pattern to create more realistic weather front appearance
          const wavePattern =
            Math.sin((x / width) * Math.PI * 4) *
            Math.cos((y / height) * Math.PI * 3) *
            3;

          // Value between 0-1, affected by distance to center and wave pattern
          const normalizedTemp = Math.max(
            0,
            Math.min(1, 1.2 - distToCenter + wavePattern / 10)
          );

          // Adjust based on real weather data
          const baseTemp = weather?.current.temperature_2m || 20;
          const minTemp =
            weather?.daily?.temperature_2m_min?.[0] || baseTemp - 10;
          const maxTemp =
            weather?.daily?.temperature_2m_max?.[0] || baseTemp + 10;
          const tempRange = maxTemp - minTemp;

          // Create a more realistic temperature distribution
          const temp = minTemp + tempRange * normalizedTemp;

          row.push({
            temp: Math.round(temp * 10) / 10,
            // Determine color code based on temperature
            color: getHeatmapColor(temp),
          });
        }
        data.push(row);
      }
      return data;
    };

    // Function to determine color based on temperature
    const getHeatmapColor = (temp: number) => {
      // More fine-grained temperature color scale for more professional visualization
      if (temp < -10) return "from-indigo-800 to-indigo-700"; // Extremely cold
      if (temp < -5) return "from-indigo-700 to-indigo-600"; // Very cold
      if (temp < 0) return "from-indigo-600 to-indigo-500"; // Freezing
      if (temp < 5) return "from-blue-600 to-blue-500"; // Cold
      if (temp < 10) return "from-blue-500 to-blue-400"; // Cool
      if (temp < 15) return "from-teal-500 to-teal-400"; // Mild cool
      if (temp < 20) return "from-green-500 to-green-400"; // Mild
      if (temp < 25) return "from-lime-500 to-lime-400"; // Warm
      if (temp < 30) return "from-yellow-500 to-yellow-400"; // Hot
      if (temp < 35) return "from-amber-500 to-amber-400"; // Very hot
      if (temp < 40) return "from-orange-600 to-orange-500"; // Extremely hot
      return "from-red-700 to-red-600"; // Dangerously hot
    };

    const heatmapData = generateHeatmapData();

    // Get temperature range for legend
    const allTemps = heatmapData.flatMap((row) => row.map((cell) => cell.temp));
    const minMapTemp = Math.floor(Math.min(...allTemps));
    const maxMapTemp = Math.ceil(Math.max(...allTemps));

    return (
      <div
        className="mt-10 animate-fade-in-up"
        style={{ animationDelay: "800ms" }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-brand-text-dark dark:text-brand-text-light">
          <span className="material-icons-outlined animate-pulse-soft">
            lan
          </span>
          Regional Heat Map (Live Visualization)
        </h3>

        <GlassCard className="p-6">
          <div className="flex flex-col">
            <div className="relative">
              <div className="grid grid-cols-20 gap-[2px] mb-6 rounded-xl overflow-hidden shadow-lg">
                {heatmapData.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="contents">
                    {row.map((cell, cellIndex) => (
                      <div
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={`aspect-square bg-gradient-to-b ${cell.color} rounded-sm hover:scale-110 transition-transform`}
                        style={{
                          animationDelay: `${(rowIndex + cellIndex) * 50}ms`,
                          opacity: 0.8 + Math.random() * 0.2,
                        }}
                        title={`${cell.temp}°${units.toUpperCase()}`}
                      >
                        {/* Show temperature on hover with tooltip */}
                        <div className="opacity-0 hover:opacity-100 transition-opacity absolute flex items-center justify-center inset-0 text-xs text-white font-bold bg-black/30 backdrop-blur-sm rounded-sm">
                          {cell.temp}°
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Add latitude and longitude indicators */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span className="material-icons-outlined text-sm mb-1">
                  north
                </span>
                <span className="rotate-90 origin-center whitespace-nowrap">
                  Latitude
                </span>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="mb-1 flex justify-center">
                  <span className="material-icons-outlined text-sm">east</span>
                </span>
                <span>Longitude</span>
              </div>
            </div>

            {/* Better temperature scale visualization */}
            <div className="mt-6 space-y-2">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Temperature Scale
              </div>
              <div className="relative h-6 rounded-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-blue-500 via-green-500 via-yellow-500 to-red-700"></div>
                <div className="absolute inset-0 flex justify-between items-center px-2 text-xs font-medium text-white">
                  <span>
                    {minMapTemp}°{units.toUpperCase()}
                  </span>
                  <span>
                    {maxMapTemp}°{units.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-indigo-600"></span>
                  <span>Very Cold</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>Cold</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span>Mild</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span>Warm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-600"></span>
                  <span>Hot</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                  *Data based on current conditions and simulated patterns
                </div>
                <div className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full">
                  <span className="material-icons-outlined text-xs align-text-top mr-1">
                    auto_awesome
                  </span>
                  Live
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  };

  // --- Render Functions for Views ---

  const renderWeather = () => (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-10 overflow-hidden">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16 px-4 animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-brand border-b-brand mb-4"></div>
          <GlassCard className="p-4 text-center shadow-lg w-full max-w-md animate-fade-in-up">
            <p className="text-lg text-neutral-800 dark:text-neutral-100">
              Fetching weather data for your location...
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              This may take a few seconds
            </p>
          </GlassCard>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex justify-center items-center py-10 px-4 animate-fade-in">
          <GlassCard
            accent="storm"
            className="p-6 text-center shadow-lg w-full max-w-md animate-fade-in-up"
          >
            <span className="material-icons-outlined text-error text-4xl mb-3 animate-pulse">
              error_outline
            </span>
            <p className="text-lg font-medium text-error mb-3">{error}</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
              Unable to access location or weather data. Please check your
              location permissions and try again.
            </p>
            <button
              onClick={fetchWeatherData}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              Try Again
            </button>
          </GlassCard>
        </div>
      )}

      {/* Weather Data */}
      {weather && !loading && !error && (
        <div className="space-y-8 animate-fade-in">
          {/* Location Information */}
          <LocationDisplay />

          {/* Header row - Location and C/F toggle */}
          <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-1 text-brand-text-dark dark:text-brand-text-light break-words">
                Current Weather
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {formatDate(weather.current.time)} -{" "}
                {formatTime(weather.current.time)} ({weather.timezone})
              </p>
            </div>
            <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-700/70 rounded-full p-1 backdrop-blur-sm">
              <button
                onClick={() => setUnits("c")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  units === "c"
                    ? "bg-brand text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-600/50"
                }`}
                aria-pressed={units === "c"}
              >
                °C
              </button>
              <button
                onClick={() => setUnits("f")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  units === "f"
                    ? "bg-brand text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-600/50"
                }`}
                aria-pressed={units === "f"}
              >
                °F
              </button>
            </div>
          </div>

          {/* Weather recommendation based on conditions */}
          <GlassCard
            accent={
              getWeatherToken(weather.current.weather_code) as
                | "sun"
                | "cloud"
                | "rain"
                | "snow"
                | "storm"
                | "fog"
            }
            className="p-6 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-start gap-4">
              <span className="material-icons-outlined text-2xl text-brand">
                tips_and_updates
              </span>
              <div>
                <h4 className="text-lg font-semibold mb-1 text-neutral-900 dark:text-white">
                  Today's Weather Tip
                </h4>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {getWeatherRecommendation(
                    getWeatherToken(weather.current.weather_code),
                    weather.current.temperature_2m
                  )}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Current weather card */}
          <GlassCard
            accent={
              getWeatherToken(weather.current.weather_code) as
                | "sun"
                | "cloud"
                | "rain"
                | "snow"
                | "storm"
                | "fog"
            }
            className="p-8 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className={`material-icons-outlined text-5xl text-${
                      getWeatherInfo(weather.current.weather_code).color
                    } animate-float`}
                  >
                    {getWeatherInfo(weather.current.weather_code).icon}
                  </span>
                  <span className="text-4xl font-bold font-variant-numeric tabular-nums text-neutral-900 dark:text-white">
                    {formatTemperature(weather.current.temperature_2m)}
                  </span>
                </div>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-2">
                  {getWeatherInfo(weather.current.weather_code).description}
                </p>
                <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="material-icons-outlined text-base mr-1 animate-rotate-slow">
                    air
                  </span>
                  <span className="font-variant-numeric tabular-nums">
                    Wind: {Math.round(weather.current.wind_speed_10m)} km/h
                  </span>
                </div>
              </div>

              {/* Today's Temp Range */}
              <div className="w-full md:flex-1 md:ml-6 mt-4 md:mt-0">
                {weather.daily && weather.daily.time.length > 0 && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Today's Min / Max
                      </span>
                      <div className="flex gap-2 text-sm font-variant-numeric tabular-nums">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {formatTemperature(
                            weather.daily.temperature_2m_min[0]
                          )}
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {formatTemperature(
                            weather.daily.temperature_2m_max[0]
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="bg-neutral-200/80 dark:bg-neutral-700/80 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full animate-shimmer"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Weather Details Card - Using dummy data */}
          {weather && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              {(() => {
                const details = generateDummyWeatherDetails(
                  weather.current.temperature_2m,
                  weather.current.weather_code
                );
                const detailItems = [
                  {
                    icon: "thermostat",
                    label: "Feels Like",
                    value: formatTemperature(details.feelsLike),
                    accent:
                      "from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20",
                    animate: "animate-bounce-light",
                  },
                  {
                    icon: "water_drop",
                    label: "Humidity",
                    value: `${details.humidity}%`,
                    accent:
                      "from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20",
                    animate: "animate-pulse-soft",
                  },
                  {
                    icon: "visibility",
                    label: "Visibility",
                    value: `${details.visibility} km`,
                    accent:
                      "from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20",
                  },
                  {
                    icon: "compress",
                    label: "Pressure",
                    value: `${details.pressure} hPa`,
                    accent:
                      "from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20",
                  },
                  {
                    icon: "wb_sunny",
                    label: "UV Index",
                    value: details.uvIndex,
                    accent:
                      "from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20",
                    animate: "animate-ping-small",
                  },
                  {
                    icon: "opacity",
                    label: "Dew Point",
                    value: formatTemperature(details.dewPoint),
                    accent:
                      "from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20",
                  },
                ];

                return detailItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`rounded-xl p-4 bg-gradient-to-b ${item.accent} backdrop-blur-sm border border-white/10 dark:border-white/5 shadow-sm animate-fade-in-up`}
                    style={{ animationDelay: `${450 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center">
                        <span
                          className={`material-icons-outlined text-xl ${
                            item.animate || ""
                          }`}
                        >
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {item.label}
                        </p>
                        <p className="text-lg font-semibold font-variant-numeric tabular-nums text-neutral-800 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Hourly forecast */}
          {weather.hourly && weather.hourly.time.length > 0 && (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "500ms" }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-brand-text-dark dark:text-brand-text-light">
                <span className="material-icons-outlined animate-float">
                  schedule
                </span>
                Hourly Forecast
              </h3>
              <div className="overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin scrollbar-thumb-neutral-400/50 dark:scrollbar-thumb-neutral-600/50 scrollbar-track-transparent">
                <div className="flex gap-3 min-w-max">
                  {weather.hourly.time.slice(0, 24).map(
                    (
                      time,
                      index // Show next 24 hours
                    ) => (
                      <GlassCard
                        key={time}
                        accent={
                          getWeatherToken(
                            weather.hourly.weather_code[index]
                          ) as
                            | "sun"
                            | "cloud"
                            | "rain"
                            | "snow"
                            | "storm"
                            | "fog"
                        }
                        className="p-3 min-w-[70px] flex flex-col items-center animate-fade-in-up"
                        style={{ animationDelay: `${550 + index * 30}ms` }}
                      >
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          {formatTime(time)}
                        </p>
                        <span
                          className={`material-icons-outlined my-2 text-2xl text-${
                            getWeatherInfo(weather.hourly.weather_code[index])
                              .color
                          } ${
                            index % 3 === 0
                              ? "animate-float"
                              : index % 3 === 1
                              ? "animate-bounce-light"
                              : "animate-pulse-soft"
                          }`}
                        >
                          {
                            getWeatherInfo(weather.hourly.weather_code[index])
                              .icon
                          }
                        </span>
                        <p className="text-base font-semibold font-variant-numeric tabular-nums text-neutral-900 dark:text-white">
                          {formatTemperature(
                            weather.hourly.temperature_2m[index]
                          )}
                        </p>
                      </GlassCard>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily forecast */}
          {weather.daily && weather.daily.time.length > 0 && (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-brand-text-dark dark:text-brand-text-light">
                <span className="material-icons-outlined animate-bounce-light">
                  calendar_month
                </span>
                7-Day Forecast
              </h3>
              <div className="grid gap-3">
                {weather.daily.time.map((day, index) => (
                  <GlassCard
                    key={day}
                    accent={
                      getWeatherToken(weather.daily.weather_code[index]) as
                        | "sun"
                        | "cloud"
                        | "rain"
                        | "snow"
                        | "storm"
                        | "fog"
                    }
                    className="p-3 flex items-center justify-between animate-fade-in-up"
                    style={{ animationDelay: `${650 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <span className="font-medium text-neutral-900 dark:text-white w-20 sm:w-24 text-sm sm:text-base">
                        {index === 0 ? "Today" : formatDate(day)}
                      </span>
                      <span
                        className={`material-icons-outlined text-xl sm:text-2xl text-${
                          getWeatherInfo(weather.daily.weather_code[index])
                            .color
                        } ${
                          index % 2 === 0
                            ? "animate-float"
                            : "animate-bounce-light"
                        }`}
                      >
                        {getWeatherInfo(weather.daily.weather_code[index]).icon}
                      </span>
                      <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 hidden md:inline truncate">
                        {
                          getWeatherInfo(weather.daily.weather_code[index])
                            .description
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base w-10 text-right font-variant-numeric tabular-nums">
                        {formatTemperature(
                          weather.daily.temperature_2m_min[index]
                        )}
                      </span>
                      <div className="bg-neutral-200/60 dark:bg-neutral-700/60 w-16 sm:w-24 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full animate-shimmer"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base w-10 text-right font-variant-numeric tabular-nums">
                        {formatTemperature(
                          weather.daily.temperature_2m_max[index]
                        )}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Heat Map */}
          {showHeatmap && <HeatmapDisplay />}
        </div>
      )}
    </section>
  );

  // Capital Weather Strip Component
  const CapitalStrip: React.FC = () => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-neutral-900 dark:text-white text-pretty">
          <span className="material-icons-outlined mr-2">public</span>
          World Capitals Weather
        </h3>

        {capitalsLoading && capitalsWeather.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-brand border-b-brand border-r-transparent border-l-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 pb-2">
            {capitalsWeather.map((capital, index) => {
              const weatherInfo = getWeatherInfo(capital.weatherCode);
              const weatherToken = getWeatherToken(capital.weatherCode);

              // Map weather token to accent type
              const accent =
                weatherToken === "clear"
                  ? "sun"
                  : weatherToken === "cloudy"
                  ? "cloud"
                  : weatherToken === "rain"
                  ? "rain"
                  : weatherToken === "snow"
                  ? "snow"
                  : weatherToken === "storm"
                  ? "storm"
                  : "fog";

              // Ensure all temperature values are valid
              const temp = isNaN(capital.temperature)
                ? "--"
                : formatTemperature(capital.temperature);
              const minTemp = isNaN(capital.tempMin)
                ? "--"
                : formatTemperature(capital.tempMin);
              const maxTemp = isNaN(capital.tempMax)
                ? "--"
                : formatTemperature(capital.tempMax);

              return (
                <GlassCard
                  key={index}
                  accent={accent}
                  className="p-4 hover:scale-105 transition-transform"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-base mb-2 text-neutral-900 dark:text-white">
                      {capital.city}
                    </div>
                    <span
                      className={`material-icons-outlined text-xl text-${
                        weatherInfo.color
                      } ${
                        index % 3 === 0
                          ? "animate-float"
                          : index % 3 === 1
                          ? "animate-bounce-light"
                          : "animate-pulse-soft"
                      }`}
                    >
                      {weatherInfo.icon}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span
                      className="text-2xl font-bold text-neutral-900 dark:text-white font-variant-numeric tabular-nums"
                      aria-live="polite"
                    >
                      {temp}
                    </span>
                    <div className="text-xs font-medium">
                      <div className="text-neutral-500 dark:text-neutral-400 mb-0.5">
                        {weatherInfo.description}
                      </div>
                      <div className="flex justify-between gap-2 font-variant-numeric tabular-nums">
                        <span className="text-blue-600 dark:text-blue-400">
                          {minTemp}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          {maxTemp}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderHome = () => (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Weather capitals strip */}
      <CapitalStrip />

      {/* Welcome Card */}
      <GlassCard accent="sun" className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="flex-1">
            <h3 className="text-pretty text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white mb-3 sm:mb-4">
              Welcome Weather App
            </h3>
            <p className="text-pretty text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mb-4 sm:mb-6">
              This app features a weather app that allows you to view the
              weather of any city in the world.
            </p>
            <button
              onClick={() => setCurrentView("Weather")}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-button hover:shadow-button-hover ${
                darkMode
                  ? "bg-brand hover:bg-brand-dark text-white"
                  : "bg-brand hover:bg-brand-dark text-white"
              }`}
            >
              <span className="material-icons-outlined text-sm">
                thermostat
              </span>
              <span>View Weather</span>
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div
                className={`w-44 sm:w-56 h-44 sm:h-56 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${
                  darkMode
                    ? "from-neutral-700/80 to-neutral-800/80"
                    : "from-neutral-200/80 to-neutral-300/80"
                }`}
              >
                <span className="material-icons-outlined text-6xl sm:text-7xl text-brand-light">
                  cloud
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-brand/60 to-brand-dark/60 backdrop-blur-sm shadow-lg">
                <span className="material-icons-outlined text-2xl sm:text-3xl text-white">
                  wb_sunny
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );

  const renderSettings = () => (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <h2 className="text-3xl font-serif font-semibold mb-8 flex items-center text-brand-text-dark dark:text-brand-text-light tracking-tight">
        <span
          className={`material-icons-outlined mr-4 text-5xl ${
            darkMode ? "text-brand drop-shadow-md" : "text-brand drop-shadow"
          } `}
        >
          settings
        </span>
        Settings
      </h2>

      {/* Appearance Settings Card */}
      <div
        className={`p-6 rounded-2xl backdrop-blur-md ${
          darkMode
            ? "bg-neutral-800/80 shadow-card-dark border border-neutral-700/50"
            : "bg-white/80 shadow-card border border-neutral-200/70"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-icons-outlined">color_lens</span>
          Appearance
        </h3>
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-300/50 dark:border-neutral-700/50">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-xl">dark_mode</span>
            <p>Dark Mode</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="sr-only peer"
              aria-label="Toggle Dark Mode"
            />
            <div
              className={`w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-white dark:peer-focus:ring-offset-neutral-800 peer-focus:ring-blue-400 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
            ></div>
          </label>
        </div>
        {/* Font Size Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <span className="material-icons-outlined text-xl">format_size</span>
            <p>Font Size</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Aa
            </span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.1"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-brand"
              aria-label="Adjust Font Size"
            />
            <span className="text-xl text-neutral-500 dark:text-neutral-400">
              Aa
            </span>
          </div>
        </div>
      </div>

      {/* Weather Settings Card (Example) */}
      <div
        className={`p-6 rounded-2xl backdrop-blur-md ${
          darkMode
            ? "bg-neutral-800/80 shadow-card-dark border border-neutral-700/50"
            : "bg-white/80 shadow-card border border-neutral-200/70"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-icons-outlined">thermostat</span>
          Weather Preferences
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-xl">
              device_thermostat
            </span>
            <p>Temperature Units</p>
          </div>
          <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-700/70 rounded-full p-1">
            <button
              onClick={() => setUnits("c")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                units === "c"
                  ? "bg-brand text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-600/50"
              }`}
              aria-pressed={units === "c"}
            >
              °C
            </button>
            <button
              onClick={() => setUnits("f")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                units === "f"
                  ? "bg-brand text-white shadow-sm"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-600/50"
              }`}
              aria-pressed={units === "f"}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "Home":
        return renderHome();
      case "Weather":
        return renderWeather();
      case "Settings":
        return renderSettings();
      default: // Should not happen with TypeScript, but good practice
        console.warn(`Unknown view: ${currentView}, rendering Home.`);
        setCurrentView("Home"); // Attempt to recover state
        return renderHome();
    }
  };

  // --- Loading Screen ---
  if (appLoading) {
    return (
      // Use a simple, non-dynamic background for the initial load
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100 dark:from-neutral-800 dark:to-neutral-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-brand border-b-brand mb-6"></div>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg font-medium">
            Loading Interface...
          </p>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div
      className={`min-h-screen flex flex-col text-brand-text-dark dark:text-brand-text-light transition-colors duration-300 ${
        currentView !== "Weather"
          ? darkMode
            ? "bg-neutral-900"
            : "bg-neutral-50"
          : "bg-transparent"
      }`} // Main background is now transparent only in Weather view
      // Font size is applied globally via useEffect to html element
    >
      {/* Dynamic Background - Renders behind everything only in Weather view */}
      {currentView === "Weather" && (
        <DynamicBackground
          weatherCode={weather?.current.weather_code}
          timeStr={weather?.current.time}
          timezone={weather?.timezone}
        />
      )}

      {/* Desktop Navbar */}
      <header
        className={`sticky top-0 z-30 h-16 md:h-20 flex items-center px-4 md:px-8 shadow-smooth transition-all duration-300 transform ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        } ${
          darkMode
            ? "bg-neutral-800/80 border-b border-neutral-700/60 backdrop-blur-lg"
            : "bg-white/80 border-b border-neutral-200/60 backdrop-blur-lg"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setCurrentView("Home")}
          >
            <span
              className={`material-icons-outlined text-2xl md:text-3xl ${
                darkMode
                  ? "text-brand drop-shadow-md"
                  : "text-brand drop-shadow"
              }`}
            >
              dashboard_customize {/* Changed icon */}
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              WeatherApp
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {(["Home", "Weather", "Settings"] as View[]).map((view) => {
              const isActive = currentView === view;
              let iconName = "";
              switch (view) {
                case "Home":
                  iconName = "home";
                  break;
                case "Weather":
                  iconName = "cloud";
                  break;
                case "Settings":
                  iconName = "settings";
                  break;
                default:
                  iconName = "circle"; // Fallback icon
              }

              return (
                <button
                  key={view}
                  className={`flex items-center gap-1.5 py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? darkMode
                        ? `text-brand bg-brand/10 shadow-inner-smooth`
                        : `text-brand bg-brand/5 shadow-inner-smooth`
                      : darkMode
                      ? "text-neutral-300 hover:text-brand-light hover:bg-neutral-700/40"
                      : "text-neutral-600 hover:text-brand hover:bg-neutral-100/70"
                  }`}
                  onClick={() => setCurrentView(view)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="material-icons-outlined text-lg -ml-1">
                    {iconName}
                  </span>
                  <span>{view}</span>
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle and Settings Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                darkMode
                  ? "bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600/80 hover:text-white shadow-button hover:shadow-button-hover"
                  : "bg-neutral-200/80 text-neutral-600 hover:bg-neutral-300/80 hover:text-neutral-800 shadow-button hover:shadow-button-hover"
              }`}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <span className="material-icons-outlined text-xl">
                {darkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              onClick={() => setCurrentView("Settings")}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                currentView === "Settings"
                  ? darkMode
                    ? "bg-brand/20 text-brand"
                    : "bg-brand/10 text-brand"
                  : darkMode
                  ? "bg-neutral-700/80 text-neutral-300 hover:bg-neutral-600/80 hover:text-white"
                  : "bg-neutral-200/80 text-neutral-600 hover:bg-neutral-300/80 hover:text-neutral-800"
              } ${
                currentView !== "Settings"
                  ? "shadow-button hover:shadow-button-hover"
                  : ""
              } `}
              aria-label="Settings"
            >
              <span className="material-icons-outlined text-xl">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-auto pb-20 md:pb-0 relative z-10">
        {renderContent()}
      </main>

      {/* Desktop Footer */}
      <footer
        className={`hidden md:block py-4 px-6 border-t relative z-10 ${
          darkMode
            ? "bg-neutral-800/80 border-neutral-700/60 backdrop-blur-md"
            : "bg-white/80 border-neutral-200/60 backdrop-blur-md"
        } transition-colors duration-300`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`material-icons-outlined text-xl ${
                darkMode ? "text-brand-light" : "text-brand"
              }`}
            >
              dashboard_customize
            </span>
            <span className="text-sm font-medium">
              WeatherApp &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Weather App |{" "}
              <span className="text-brand dark:text-brand-light">
                React & Tailwind
              </span>
            </div>
            <div className="flex items-center gap-2">
              {["cloud", "wb_sunny", "water_drop"].map((icon) => (
                <span
                  key={icon}
                  className={`material-icons-outlined text-lg text-neutral-500 dark:text-neutral-400`}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Toast notifications */}
      {toastState && (
        <div
          className={`fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg shadow-xl z-[60] animate-fade-in max-w-sm w-11/12 text-center text-sm font-medium border backdrop-blur-sm ${
            toastState.type === "success"
              ? "bg-success/90 text-white border-success/30"
              : toastState.type === "error"
              ? "bg-error/90 text-white border-error/30"
              : "bg-info/90 text-white border-info/30"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="material-icons-outlined text-base">
              {toastState.type === "success"
                ? "check_circle"
                : toastState.type === "error"
                ? "error"
                : "info"}
            </span>
            {toastState.message}
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <nav
        className={`fixed md:hidden bottom-0 left-0 right-0 h-14 flex items-stretch justify-around px-1 border-t z-40 transition-all duration-300 transform ${
          scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
        } ${
          darkMode
            ? "bg-neutral-800/90 border-neutral-700/70 backdrop-blur-lg"
            : "bg-white/90 border-neutral-200/70 backdrop-blur-lg"
        } shadow-[0_-2px_8px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_-1px_rgba(0,0,0,0.2)]`}
      >
        {(["Home", "Weather", "Settings"] as View[]).map((view) => {
          const isActive = currentView === view;
          let iconName = "";
          switch (view) {
            case "Home":
              iconName = "home";
              break;
            case "Weather":
              iconName = "cloud";
              break;
            case "Settings":
              iconName = "settings";
              break;
            default:
              iconName = "circle";
          }

          return (
            <button
              key={view}
              className={`flex flex-col items-center justify-center flex-grow basis-0 transition-all duration-200 rounded-md m-0.5 ${
                isActive
                  ? darkMode
                    ? `text-brand bg-brand/10`
                    : `text-brand bg-brand/5`
                  : darkMode
                  ? "text-neutral-400 hover:text-brand-light"
                  : "text-neutral-500 hover:text-brand"
              }`}
              onClick={() => setCurrentView(view)}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`material-icons-outlined text-xl transition-transform duration-200 ${
                  isActive
                    ? "scale-110 motion-safe:animate-pulse-soft"
                    : "scale-100"
                }`}
              >
                {iconName}
              </span>
              <span className="text-[10px] mt-0.5 font-medium">{view}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
