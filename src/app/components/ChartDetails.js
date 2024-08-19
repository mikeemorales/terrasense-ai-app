"use client";
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const ChartDetails = ({ airQualityData, comparisonData }) => {
    if (!airQualityData || airQualityData.length === 0) {
        return null;
    }

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#0096d6'; // Good
        if (aqi <= 100) return '#6ec40c'; // Moderate
        if (aqi <= 150) return '#f17a12'; // Unhealthy for Sensitive Groups
        if (aqi <= 200) return '#e7264c'; // Unhealthy
        if (aqi <= 300) return '#9f7fad'; // Very Unhealthy
        return '#641c24'; // Hazardous
    };

    const getRecommendations = (airQualityData) => {
        const categories = {
            Good: [],
            Moderate: [],
            UnhealthyForSensitiveGroups: [],
            Unhealthy: [],
            VeryUnhealthy: [],
            Hazardous: []
        };
    
        // Categorize the parameters based on AQI levels
        airQualityData.forEach(item => {
            const { ParameterName, AQI } = item;
            
            if (AQI <= 50) {
                categories.Good.push(ParameterName);
            } else if (AQI <= 100) {
                categories.Moderate.push(ParameterName);
            } else if (AQI <= 150) {
                categories.UnhealthyForSensitiveGroups.push(ParameterName);
            } else if (AQI <= 200) {
                categories.Unhealthy.push(ParameterName);
            } else if (AQI <= 300) {
                categories.VeryUnhealthy.push(ParameterName);
            } else {
                categories.Hazardous.push(ParameterName);
            }
        });
    
        const recommendations = [];
    
        // Generate recommendations based on grouped parameters
        if (categories.Good.length > 0) {
            recommendations.push(`${categories.Good.join(', ')} are all in the Good category. Enjoy your day outside!`);
        }
        if (categories.Moderate.length > 0) {
            recommendations.push(`${categories.Moderate.join(', ')} are in the Moderate category. Sensitive individuals should consider limiting prolonged outdoor exertion.`);
        }
        if (categories.UnhealthyForSensitiveGroups.length > 0) {
            recommendations.push(`${categories.UnhealthyForSensitiveGroups.join(', ')} are in the Unhealthy for Sensitive Groups category. Those with respiratory conditions should limit outdoor activity.`);
        }
        if (categories.Unhealthy.length > 0) {
            recommendations.push(`${categories.Unhealthy.join(', ')} are in the Unhealthy category. Consider staying indoors and reducing physical activity outside.`);
        }
        if (categories.VeryUnhealthy.length > 0) {
            recommendations.push(`${categories.VeryUnhealthy.join(', ')} are in the Very Unhealthy category. Everyone should avoid outdoor exertion.`);
        }
        if (categories.Hazardous.length > 0) {
            recommendations.push(`${categories.Hazardous.join(', ')} are in the Hazardous category. Stay indoors and keep windows closed.`);
        }
    
        return recommendations;
    };
    

    const getComparisonDetails = (airQualityData, comparisonData) => {
        const comparisonDetails = [];

        airQualityData.forEach(item => {
            const { ParameterName, AQI } = item;
            const comparisonItem = comparisonData.find(compItem => compItem.ParameterName === ParameterName);

            if (comparisonItem) {
                const comparisonAQI = comparisonItem.AQI;
                const difference = AQI - comparisonAQI;
                const sign = difference > 0 ? '+' : '';

                comparisonDetails.push(
                    `For ${ParameterName}, the AQI is ${AQI} (${getAQIColor(AQI)}). Compared to the other location's AQI of ${comparisonAQI} (${getAQIColor(comparisonAQI)}), the difference is ${sign}${difference}.`
                );
            }
        });
        return comparisonDetails;
    };

    const parameters = Array.from(new Set(airQualityData.map(item => item.ParameterName)));

    return (
        <Box>
            <Typography sx={{ color: 'white', mt: 2 }}>
                The chart displays the AQI values for the following pollutants:
            </Typography>
            <ul>
                {parameters.map(param => {
                    const paramData = airQualityData.find(item => item.ParameterName === param);
                    return (
                        <li key={param} style={{ color: getAQIColor(paramData.AQI) }}>
                            <strong>{param}:</strong> The AQI level for {param} is <span style={{ color: getAQIColor(paramData.AQI) }}>{paramData.AQI}</span>.
                        </li>
                    );
                })}
            </ul>

            {airQualityData && (
                <Box mt={3}>
                    <Typography variant="h6" sx={{ color: 'white' }}>Recommendations:</Typography>
                    <ul>
                        {getRecommendations(airQualityData).map((rec, index) => (
                            <li key={index} style={{ color: 'white' }}>{rec}</li>
                        ))}
                    </ul>
                </Box>
            )}

            {comparisonData && (
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: 'white' }}>Comparison Details:</Typography>
                    <ul>
                        {getComparisonDetails(airQualityData, comparisonData).map((detail, index) => (
                            <li key={index} style={{ color: 'white' }}>{detail}</li>
                        ))}
                    </ul>
                </Box>
            )}
            <Typography variant="h6" sx={{ color: 'white', mt: 4 }}>
                Air Quality Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ color: 'white' }}>
                This chart shows the Air Quality Index (AQI) for different pollutants in the specified area.
            </Typography>
            <Typography sx={{ color: 'white', mt: 2 }}>
                The AQI is a measure of air pollution and is categorized into different levels:
            </Typography>
            <ul>
                <li><strong><span style={{ color: '#0096d6' }}>Good (0-50)</span>:</strong> Air quality is considered satisfactory, and air pollution poses little or no risk.</li>
                <li><strong><span style={{ color: '#6ec40c' }}>Moderate (51-100)</span>:</strong> Air quality is acceptable; however, there may be a risk for some pollutants for a small number of people.</li>
                <li><strong><span style={{ color: '#f17a12' }}>Unhealthy for Sensitive Groups (101-150)</span>:</strong> Members of sensitive groups may experience health effects. The general public is less likely to be affected.</li>
                <li><strong><span style={{ color: '#e7264c' }}>Unhealthy (151-200)</span>:</strong> Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.</li>
                <li><strong><span style={{ color: '#9f7fad' }}>Very Unhealthy (201-300)</span>:</strong> Health alert: everyone may experience more serious health effects.</li>
                <li><strong><span style={{ color: '#641c24' }}>Hazardous (301 and above)</span>:</strong> Health warnings of emergency conditions. The entire population is more likely to be affected.</li>
            </ul>
        </Box>
    );
};

export default ChartDetails;
