const auth0Management = require('../services/auth0Management');
const logger = require('../utils/logger');

async function initializeAuth0() {
  try {
    // Create basic user role
    const userRole = await auth0Management.createRole(
      'user',
      'Basic user with read access',
      [
        { permission_name: 'read:news', resource_server_identifier: 'https://api.ecotrack.com' },
        { permission_name: 'read:data', resource_server_identifier: 'https://api.ecotrack.com' }
      ]
    );

    // Create admin role
    const adminRole = await auth0Management.createRole(
      'admin',
      'Administrator with full access',
      [
        { permission_name: 'read:news', resource_server_identifier: 'https://api.ecotrack.com' },
        { permission_name: 'write:news', resource_server_identifier: 'https://api.ecotrack.com' },
        { permission_name: 'read:data', resource_server_identifier: 'https://api.ecotrack.com' },
        { permission_name: 'write:data', resource_server_identifier: 'https://api.ecotrack.com' },
        { permission_name: 'read:users', resource_server_identifier: 'https://api.ecotrack.com' },
        { permission_name: 'update:users', resource_server_identifier: 'https://api.ecotrack.com' }
      ]
    );

    logger.info('Auth0 roles and permissions initialized successfully');
    return { userRole, adminRole };
  } catch (error) {
    logger.error('Failed to initialize Auth0 roles:', error);
    throw error;
  }
}

// Run this script directly to initialize Auth0
if (require.main === module) {
  initializeAuth0()
    .then(() => {
      console.log('Auth0 initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Auth0 initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeAuth0;