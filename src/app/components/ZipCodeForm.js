// Import necessary libraries and components
"use client";
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Grid, colors, FilledInput } from '@mui/material';
import { BarChart, BarLabel } from '@mui/x-charts/BarChart';
import ChartDetails from './ChartDetails';
import { YAxis } from 'recharts';
import { BarLabelComponent } from '@mui/x-charts/BarChart/BarLabel/BarLabel';

const ZipCodeForm = () => {
    const [location, setLocation] = useState('');
    const [airQualityData, setAirQualityData] = useState(null);
    const [compareData, setCompareData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [cityName, setCityName] = useState('');
    const [comparisonMode, setComparisonMode] = useState(false);

    // Handle form submission for fetching air quality data
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

    // Handle fetching user location and air quality data
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

    // Handle fetching Seattle's air quality data for comparison
    const handleComparison = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://www.airnowapi.org/aq/forecast/zipCode/?format=application/json&zipCode=98101&distance=25&API_KEY=${process.env.NEXT_PUBLIC_AIRNOW_API_KEY}`); // Seattle ZIP code
            if (!response.ok) {
                throw new Error('Failed to fetch comparison data');
            }
            const data = await response.json();
            setCompareData(data);
        } catch (error) {
            console.error('Error:', error);
            setCompareData(null);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const airQualityParameters = airQualityData ? airQualityData.map(item => item.ParameterName) : [];
    const yourLocationData = airQualityData ? airQualityData.map(item => item.AQI) : [];
    const seattleData = compareData ? compareData.map(item => item.AQI) : [];

    const colors = ['#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'];

    const chartSetting = {
        xAxis: [
            {
                scaleType: 'band',
                data: airQualityParameters,
                // colorMap: {
                //     type: 'ordinal',
                //     colors
                // }
            }
        ],
        yAxis: [
            {
                label: 'AQI',
            },
        ],
        series: [
            { name: 'Your Location', data: yourLocationData, label: cityName},
            { name: 'Seattle', data: seattleData, label: 'seattle, wa'}
        ],
         sx: {
            fill: '#ffffff',
            backgroundColor: 'white',
         },
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
        >
            {/* User input and buttons */}
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
                Check Air Quality
            </Button>
            <Button onClick={getUserLocation} variant="contained" color="secondary">
                Use My Location
            </Button>

            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {error && <Typography color="error">{error}</Typography>}
            
            {airQualityData && (
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                        Air Quality Data for {cityName || 'Selected Location'}:
                    </Typography>
                    <BarChart
                        height={300}
                        {...chartSetting}
                        grid={{ horizontal: true }}
                    />
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
                </Box>
            )}
            <ChartDetails airQualityData={airQualityData} />
        </Box>
    );
};

export default ZipCodeForm;