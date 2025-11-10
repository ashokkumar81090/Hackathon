/**
 * ServiceNow Integration
 */

export { ServiceNowClient } from './client.js';
export { mapServiceNowIncident, mapServiceNowIncidents, getIncidentStatistics } from './mapper.js';
export type {
  ServiceNowIncident,
  ServiceNowResponse,
  ServiceNowConfig,
  FetchIncidentsOptions,
  MappedIncident,
} from './types.js';

