const axios = require('axios');
const { AppError } = require('../middleware/errorHandler');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// Development mock data
const mockAirQualityData = {
    location: "Sample City",
    coordinates: { lat: 40.7128, lon: -74.0060 },
    measurements: [
        {
            parameter: "pm25",
            value: 15.0,
            unit: "µg/m³",
            lastUpdated: new Date().toISOString(),
            station: "Sample Station 1"
        }
    ]
};

const mockCityRankings = {
    rankings: Array.from({ length: 10 }, (_, i) => ({
        city: `City ${i + 1}`,
        country: "Sample Country",
        value: Math.random() * 50,
        unit: "µg/m³",
        lastUpdated: new Date().toISOString()
    }))
};

// Initialize axios instance conditionally
const axiosInstance = config.OPENAQ_API_KEY !== 'development' ? axios.create({
    baseURL: 'https://api.openaq.org/v2',
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'apikey': config.OPENAQ_API_KEY
    }
}) : null;

// Add response interceptor for better error handling
if (axiosInstance) {
    axiosInstance.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 429) {
                logger.warn('OpenAQ API rate limit reached');
                throw new AppError('Rate limit exceeded, please try again later', 429);
            }
            throw error;
        }
    );
}

const getAirQuality = async (req, res, next) => {
    try {
        // Return mock data in development mode if no API key
        if (config.OPENAQ_API_KEY === 'development') {
            logger.info('Using mock air quality data (development mode)');
            return res.json({
                status: 'success',
                data: mockAirQualityData
            });
        }

        const { location, radius = 10000 } = req.query;
        
        if (!location) {
            throw new AppError('Location is required', 400);
        }

        // Get coordinates from location name
        try {
            const geocodeResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: location,
                    format: 'json',
                    limit: 1
                },
                headers: {
                    'User-Agent': 'EcoTrack/1.0'
                }
            });

            if (!geocodeResponse.data?.[0]) {
                throw new AppError('Location not found', 404);
            }

            const { lat, lon } = geocodeResponse.data[0];

            // Get air quality data from OpenAQ
            const response = await axiosInstance.get('/measurements', {
                params: {
                    coordinates: `${lat},${lon}`,
                    radius,
                    limit: 100,
                    order_by: 'datetime',
                    sort: 'desc'
                }
            });

            if (!response.data?.results?.length) {
                throw new AppError('No air quality data available for this location', 404);
            }

            // Normalize and validate measurements data
            const measurements = response.data.results
                .filter(result => result.value != null && !isNaN(result.value))
                .map(result => ({
                    parameter: result.parameter,
                    value: Number(result.value),
                    unit: result.unit,
                    lastUpdated: result.date.utc,
                    station: result.location
                }));

            if (measurements.length === 0) {
                throw new AppError('No valid measurements found for this location', 404);
            }

            // Format response with consistent coordinate format
            const formattedData = {
                location: geocodeResponse.data[0].display_name,
                coordinates: { lat, lon }, // Consistent coordinate format
                measurements
            };

            // Cache handling
            if (req.cache) {
                const cacheKey = `airquality:${location}`;
                await req.cache.set(cacheKey, formattedData, 300);
            }

            logger.info(`Air quality data fetched for location: ${location}`);
            res.json({
                status: 'success',
                data: formattedData
            });
        } catch (geocodeError) {
            logger.error('Geocoding error:', geocodeError);
            throw new AppError(
                geocodeError.response?.status === 429 
                    ? 'Location search rate limit exceeded, please try again later'
                    : 'Failed to geocode location', 
                geocodeError.response?.status === 429 ? 429 : 502
            );
        }
    } catch (error) {
        logger.error('Air quality data fetch error:', error);
        next(error.isOperational ? error : new AppError('Failed to fetch air quality data', 502));
    }
};

// Update getCityRankings to use consistent format
const getCityRankings = async (req, res, next) => {
    try {
        // Return mock data in development mode if no API key
        if (config.OPENAQ_API_KEY === 'development') {
            logger.info('Using mock city rankings data (development mode)');
            return res.json({
                status: 'success',
                data: mockCityRankings
            });
        }

        const { parameter = 'pm25', limit = 10 } = req.query;

        const response = await axiosInstance.get('/locations', {
            params: {
                parameter,
                limit,
                order_by: 'value',
                sort: 'desc'
            }
        });

        if (!response.data?.results?.length) {
            throw new AppError('No ranking data available', 404);
        }

        const rankings = response.data.results
            .filter(location => {
                const paramData = location.parameters?.find(p => p.parameter === parameter);
                return paramData?.average != null && !isNaN(paramData.average);
            })
            .map(location => ({
                city: location.city || 'Unknown City',
                country: location.country || 'Unknown Country',
                value: Number(location.parameters.find(p => p.parameter === parameter).average),
                unit: location.parameters.find(p => p.parameter === parameter).unit,
                coordinates: {
                    lat: location.coordinates?.latitude || null,
                    lon: location.coordinates?.longitude || null
                },
                lastUpdated: location.lastUpdated
            }));

        if (rankings.length === 0) {
            throw new AppError(`No valid ${parameter} data available for rankings`, 404);
        }

        logger.info(`City rankings fetched for parameter: ${parameter}`);
        res.json({
            status: 'success',
            data: { rankings }
        });
    } catch (error) {
        logger.error('City rankings fetch error:', error);
        next(error.isOperational ? error : new AppError('Failed to fetch city rankings', 502));
    }
};

module.exports = {
    getAirQuality,
    getCityRankings
};