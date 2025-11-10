/**
 * ServiceNow REST API Client
 */

import axios, { AxiosInstance } from 'axios';
import {
  ServiceNowConfig,
  ServiceNowIncident,
  ServiceNowResponse,
  FetchIncidentsOptions,
} from './types.js';

export class ServiceNowClient {
  private client: AxiosInstance;
  private config: ServiceNowConfig;

  constructor(config: ServiceNowConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: `${config.instanceUrl}/api/${config.apiVersion || 'now/v2'}/table`,
      auth: {
        username: config.username,
        password: config.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Fetch incidents from ServiceNow
   */
  async fetchIncidents(
    options: FetchIncidentsOptions = {}
  ): Promise<ServiceNowIncident[]> {
    const {
      limit = 500,
      offset = 0,
      query,
      fields,
      orderBy = 'opened_at',
    } = options;

    try {
      console.log(`[ServiceNow] Fetching incidents from ${this.config.instanceUrl}...`);
      console.log(`[ServiceNow] Limit: ${limit}, Offset: ${offset}`);

      const params: any = {
        sysparm_limit: limit,
        sysparm_offset: offset,
        sysparm_display_value: 'all',
      };

      // Add query filter if provided
      if (query) {
        params.sysparm_query = query;
      } else {
        // Default: fetch active incidents, ordered by opened_at
        params.sysparm_query = `active=true^ORDERBYDESC${orderBy}`;
      }

      // Add specific fields if provided
      if (fields && fields.length > 0) {
        params.sysparm_fields = fields.join(',');
      }

      const response = await this.client.get<ServiceNowResponse<ServiceNowIncident>>(
        '/incident',
        { params }
      );

      const incidents = response.data.result;
      console.log(`[ServiceNow] ✓ Successfully fetched ${incidents.length} incidents`);

      return incidents;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[ServiceNow] API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data,
        });
        
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Check your ServiceNow credentials.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. Check your ServiceNow permissions.');
        }
        if (error.response?.status === 404) {
          throw new Error('ServiceNow instance or endpoint not found.');
        }
      }
      
      throw new Error(
        `Failed to fetch incidents: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Test connection to ServiceNow
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[ServiceNow] Testing connection...');
      
      const response = await this.client.get('/incident', {
        params: {
          sysparm_limit: 1,
        },
      });

      console.log('[ServiceNow] ✓ Connection successful');
      return true;
    } catch (error) {
      console.error('[ServiceNow] ✗ Connection failed:', error);
      return false;
    }
  }

  /**
   * Get incident count
   */
  async getIncidentCount(query?: string): Promise<number> {
    try {
      const params: any = {
        sysparm_limit: 1,
        sysparm_display_value: 'false',
      };

      if (query) {
        params.sysparm_query = query;
      }

      const response = await this.client.get<ServiceNowResponse<ServiceNowIncident>>(
        '/incident',
        {
          params,
          headers: {
            'X-Total-Count': 'true',
          },
        }
      );

      const totalCount = response.headers['x-total-count'];
      return totalCount ? parseInt(totalCount, 10) : 0;
    } catch (error) {
      console.error('[ServiceNow] Failed to get incident count:', error);
      return 0;
    }
  }

  /**
   * Fetch a single incident by number
   */
  async fetchIncidentByNumber(incidentNumber: string): Promise<ServiceNowIncident | null> {
    try {
      const response = await this.client.get<ServiceNowResponse<ServiceNowIncident>>(
        '/incident',
        {
          params: {
            sysparm_query: `number=${incidentNumber}`,
            sysparm_limit: 1,
          },
        }
      );

      return response.data.result[0] || null;
    } catch (error) {
      console.error(`[ServiceNow] Failed to fetch incident ${incidentNumber}:`, error);
      return null;
    }
  }
}

