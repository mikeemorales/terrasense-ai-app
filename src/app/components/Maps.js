// app/components/Map.js
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic from Next.js
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet map component to avoid server-side rendering issues
const MapComponent = dynamic(() => import('react-leaflet'), { ssr: false });

const Map = ({ airQualityData }) => {
  // Create state for the map data
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    // Process air quality data into map markers
    if (airQualityData) {
      setMapData(airQualityData.map((data) => ({
        position: [data.Latitude, data.Longitude],
        parameter: data.ParameterName,
        aqi: data.AQI,
        category: data.Category.Name,
      })));
    }
  }, [airQualityData]);

  return (
    <MapContainer center={[33.869, -117.8903]} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mapData.map((data, index) => (
        <Marker key={index} position={data.position}>
          <Popup>
            <strong>{data.parameter}</strong><br />
            AQI: {data.aqi}<br />
            Category: {data.category}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
