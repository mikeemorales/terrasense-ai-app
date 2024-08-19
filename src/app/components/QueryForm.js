"use client";

import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const QueryForm = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await fetch('/api/gpt-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                throw new Error('Failed to fetch response');
            }

            const data = await res.json();
            setResponse(data.response);
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setResponse('');
            setError(error.message);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
        >
            <TextField
                label="Enter your query"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
                Submit
            </Button>
            {error && <Typography color="error">{error}</Typography>}
            {response && (
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                        Response:
                    </Typography>
                    <Typography sx={{ color: 'white' }}>{response}</Typography>
                </Box>
            )}
        </Box>
    );
}

export default QueryForm;
