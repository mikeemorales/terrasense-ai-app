import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComparisonChart = ({ airQualityData, comparisonData }) => {
  const chartData = airQualityData.map((item, index) => ({
    parameter: item.ParameterName,
    yourLocation: item.AQI,
    comparisonLocation: comparisonData[index] ? comparisonData[index].AQI : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="parameter" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="yourLocation" fill="#8884d8" name="Your Location" />
        <Bar dataKey="comparisonLocation" fill="#82ca9d" name="Seattle" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;
