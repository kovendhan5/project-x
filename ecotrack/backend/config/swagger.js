const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoTrack API Documentation',
      version: '1.0.0',
      description: 'API documentation for the EcoTrack environmental monitoring platform',
      contact: {
        name: 'API Support',
        email: 'support@ecotrack.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'User\'s unique username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address'
            },
            preferences: {
              type: 'object',
              properties: {
                newsCategories: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['environment', 'climate', 'energy', 'sustainability']
                  }
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'boolean'
                    },
                    push: {
                      type: 'boolean'
                    }
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management endpoints'
      },
      {
        name: 'News',
        description: 'Environmental news and articles endpoints'
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js']
};

module.exports = swaggerJsdoc(options);