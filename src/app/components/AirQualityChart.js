"use client"
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Box, Typography } from '@mui/material';

const AirQualityChart = ({ data }) => {
  // Prepare data for the chart
  const chartData = data.map(item => ({
    parameter: item.ParameterName,
    aqi: item.AQI
  }));

  // Custom tooltip content style
  const tooltipStyle = {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: 'white' }}>Air Quality Index by Parameter</Typography>
      <BarChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="parameter" />
        <YAxis />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="aqi" fill="#8884d8" />
      </BarChart>
    </Box>
  );
};

export default AirQualityChart;
