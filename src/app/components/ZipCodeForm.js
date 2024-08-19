"use client";
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Grid } from '@mui/material';
import Chart from 'react-apexcharts';
import ChartDetails from './ChartDetails';

const ZipCodeForm = () => {
    const [location, setLocation] = useState('');
    const [airQualityData, setAirQualityData] = useState(null);
    const [compareData, setCompareData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [cityName, setCityName] = useState('');
    const [comparisonMode, setComparisonMode] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            // Fetch latitude and longitude based on city name
            const geocodeResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`);
            if (!geocodeResponse.ok) {
                throw new Error('Failed to fetch location data');
            }
            const geocodeData = await geocodeResponse.json();
            const { lat, lng } = geocodeData.results[0].geometry;
            setUserLocation({ latitude: lat, longitude: lng });

            // Fetch air quality data based on latitude and longitude
            const response = await fetch(`https://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=${lat}&longitude=${lng}&distance=25&API_KEY=${process.env.NEXT_PUBLIC_AIRNOW_API_KEY}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setAirQualityData(data);
            setCityName(location);
            setError(null);
            setComparisonMode(true); // Show the comparison button after fetching data
        } catch (error) {
            console.error('Error:', error);
            setAirQualityData(null);
            setError(error.message);
            setCityName('Unknown');
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });

                    try {
                        // Fetch air quality data based on user location
                        const response = await fetch(`https://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=${latitude}&longitude=${longitude}&distance=25&API_KEY=${process.env.NEXT_PUBLIC_AIRNOW_API_KEY}`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch data');
                        }
                        const data = await response.json();
                        setAirQualityData(data);
                        setError(null);

                        // Get city name from latitude and longitude using reverse geocoding
                        const geocodeResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`);
                        if (!geocodeResponse.ok) {
                            throw new Error('Failed to fetch city name');
                        }
                        const geocodeData = await geocodeResponse.json();
                        setCityName(geocodeData.results[0].components.city || 'Unknown');
                        setComparisonMode(true); // Show the comparison button after fetching data
                    } catch (error) {
                        console.error('Error:', error);
                        setAirQualityData(null);
                        setError(error.message);
                        setCityName('Unknown');
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Unable to retrieve your location');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser');
        }
    };

    const handleComparison = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://www.airnowapi.org/aq/forecast/zipCode/?format=application/json&zipCode=98101&distance=25&API_KEY=${process.env.NEXT_PUBLIC_AIRNOW_API_KEY}`); // Seattle ZIP code
            if (!response.ok) {
                throw new Error('Failed to fetch comparison data');
            }
            const data = await response.json();
            console.log('Seattle Data:', data); // Log data to check its structure
            setCompareData(data);
        } catch (error) {
            console.error('Error:', error);
            setCompareData(null);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Transform data for the chart
    const chartData = {
        series: airQualityData ? airQualityData.map(item => ({
            name: item.ParameterName,
            data: [{ x: item.DateForecast, y: item.AQI }]
        })) : [],
        options: {
            chart: {
                type: 'bar'
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                title: {
                    text: 'AQI'
                }
            },
            title: {
                text: 'Air Quality Index by Pollutant',
                align: 'left'
            }
        }
    };

    const comparisonChartData = {
        series: compareData ? compareData.reduce((acc, item) => {
            const existing = acc.find(series => series.name === item.ParameterName);
            if (existing) {
                existing.data.push({ x: item.DateForecast, y: item.AQI });
            } else {
                acc.push({
                    name: item.ParameterName,
                    data: [{ x: item.DateForecast, y: item.AQI }]
                });
            }
            return acc;
        }, []) : [],
        options: {
            chart: {
                type: 'bar'
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                title: {
                    text: 'AQI'
                }
            },
            title: {
                text: 'Air Quality Index by Pollutant',
                align: 'left'
            }
        }
    };

    const getComparisonDifference = () => {
        if (!airQualityData || !compareData) return null;

        const comparison = airQualityData.reduce((acc, item) => {
            const compareItem = compareData.find(ci => ci.ParameterName === item.ParameterName);
            if (compareItem) {
                acc[item.ParameterName] = {
                    userAQI: item.AQI,
                    seattleAQI: compareItem.AQI,
                    difference: item.AQI - compareItem.AQI
                };
            }
            return acc;
        }, {});

        return comparison;
    };

    const comparisonDifference = getComparisonDifference();
    
    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
        >
            <TextField
                label="Enter city and state"
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
                InputProps={{
                    sx: {
                        color: 'white'
                    }
                }}
                InputLabelProps={{
                    sx: {
                        color: 'white',
                    },
                }}
                sx={{
                    '.MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'white',
                        },
                        '&:hover fieldset': {
                            borderColor: 'white',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                        },
                    },
                }}
            />
            <Button type="submit" variant="contained" color="primary">
                Get Air Quality Data
            </Button>
            <Button onClick={getUserLocation} variant="contained" color="secondary">
                Use My Location
            </Button>
            {comparisonMode && (
                <Button
                    onClick={handleComparison}
                    variant="contained"
                    color="info"
                    sx={{ mt: 2 }}
                >
                    Compare with Seattle
                </Button>
            )}
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {error && <Typography color="error">{error}</Typography>}
            {airQualityData && (
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: 'white' }}>Air Quality Data for {cityName || 'Selected Location'}:</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Chart
                                options={chartData.options}
                                series={chartData.series}
                                type="bar"
                                height={350}
                            />
                        </Grid>
                        {compareData && compareData.length > 0 && (
                            <Grid item xs={12} md={6}>
                                <Box mt={-4}>
                                    <Typography variant="h6" sx={{ color: 'white' }}>Comparison Chart for Seattle:</Typography>
                                    <Chart
                                        options={comparisonChartData.options}
                                        series={comparisonChartData.series}
                                        type="bar"
                                        height={350}
                                    />
                                    {compareData.every(item => item.ParameterName === 'PM2.5') && (
                                        <Typography sx={{ color: 'white', mt: 2 }}>
                                            Note: Only PM2.5 data is available for comparison.
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                    {comparisonDifference && (
                        <Box mt={4}>
                            <Typography variant="h6" sx={{ color: 'white' }}>Comparison Details:</Typography>
                            <ul>
                                {Object.entries(comparisonDifference).map(([param, details]) => {
                                    const difference = details.userAQI - details.seattleAQI;
                                    const comparison = difference > 0 ? 'worse' : difference < 0 ? 'better' : 'equal';
                                    const severity = Math.abs(difference) <= 10 ? 'slightly' : Math.abs(difference) <= 30 ? 'moderately' : 'significantly';

                                    const explanation = `The air quality for ${param} in your location is ${severity} ${comparison} than Seattle. A difference of ${Math.abs(difference)} points indicates that your area's air quality is ${comparison} affected compared to Seattle.`;

                                    return (
                                        <li key={param} style={{ color: 'white' }}>
                                            <strong>{param}:</strong> Your location has an AQI of {details.userAQI}, while Seattle has an AQI of {details.seattleAQI}. The difference is {difference > 0 ? `+${difference}` : difference}. {explanation}
                                        </li>
                                    );
                                })}
                            </ul>
                        </Box>
                    )}
                </Box>
            )}
            <ChartDetails airQualityData={airQualityData} />
        </Box>
    );
};

export default ZipCodeForm;

