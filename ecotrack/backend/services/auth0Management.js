const axios = require('axios');
const { config } = require('../config/env');
const logger = require('../utils/logger');

class Auth0ManagementAPI {
  constructor() {
    this.domain = config.AUTH0.DOMAIN;
    this.audience = `https://${config.AUTH0.DOMAIN}/api/v2/`;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getManagementToken() {
    try {
      if (this.token && this.tokenExpiry > Date.now()) {
        return this.token;
      }

      const response = await axios.post(`https://${this.domain}/oauth/token`, {
        client_id: config.AUTH0.CLIENT_ID,
        client_secret: config.AUTH0.CLIENT_SECRET,
        audience: this.audience,
        grant_type: 'client_credentials'
      });

      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.token;
    } catch (error) {
      logger.error('Error getting management token:', error);
      throw new Error('Failed to get management token');
    }
  }

  async getClient() {
    const token = await this.getManagementToken();
    return axios.create({
      baseURL: `https://${this.domain}/api/v2`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async assignRolesToUser(userId, roles) {
    try {
      const client = await this.getClient();
      await client.post(`/users/${userId}/roles`, { roles });
      logger.info(`Roles assigned to user ${userId}: ${roles.join(', ')}`);
    } catch (error) {
      logger.error('Error assigning roles:', error);
      throw error;
    }
  }

  async getUserRoles(userId) {
    try {
      const client = await this.getClient();
      const response = await client.get(`/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      logger.error('Error getting user roles:', error);
      throw error;
    }
  }

  async updateUserMetadata(userId, metadata) {
    try {
      const client = await this.getClient();
      await client.patch(`/users/${userId}`, {
        app_metadata: metadata
      });
      logger.info(`Metadata updated for user ${userId}`);
    } catch (error) {
      logger.error('Error updating user metadata:', error);
      throw error;
    }
  }

  async createRole(name, description, permissions = []) {
    try {
      const client = await this.getClient();
      const response = await client.post('/roles', {
        name,
        description,
        permissions
      });
      logger.info(`Role created: ${name}`);
      return response.data;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  async getRolePermissions(roleId) {
    try {
      const client = await this.getClient();
      const response = await client.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      logger.error('Error getting role permissions:', error);
      throw error;
    }
  }
}

module.exports = new Auth0ManagementAPI();