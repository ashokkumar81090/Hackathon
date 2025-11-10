/**
 * Mapper to convert ServiceNow incidents to our internal format
 */

import { ServiceNowIncident, MappedIncident } from './types.js';

/**
 * State mapping from ServiceNow to human-readable
 */
const stateMap: Record<string, string> = {
  '1': 'New',
  '2': 'In Progress',
  '3': 'On Hold',
  '6': 'Resolved',
  '7': 'Closed',
  '8': 'Canceled',
};

/**
 * Priority mapping
 */
const priorityMap: Record<string, string> = {
  '1': 'Critical',
  '2': 'High',
  '3': 'Medium',
  '4': 'Low',
  '5': 'Planning',
};

/**
 * Urgency/Impact mapping
 */
const urgencyImpactMap: Record<string, string> = {
  '1': 'High',
  '2': 'Medium',
  '3': 'Low',
};

/**
 * Extract display value from ServiceNow field (handles both strings and objects)
 */
function extractValue(field: any, preferValue: boolean = false): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    // For numeric codes (priority, urgency, impact, state), prefer value over display_value
    if (preferValue) {
      return field.value || field.display_value || '';
    }
    return field.display_value || field.value || '';
  }
  return String(field);
}

/**
 * Map ServiceNow incident to our internal format
 */
export function mapServiceNowIncident(snIncident: ServiceNowIncident): MappedIncident {
  // Extract actual values from nested objects (use value field for numeric codes)
  const stateValue = extractValue(snIncident.state, true);
  const priorityValue = extractValue(snIncident.priority, true);
  const urgencyValue = extractValue(snIncident.urgency, true);
  const impactValue = extractValue(snIncident.impact, true);
  
  // Map to human-readable values
  const status = stateMap[stateValue] || 'Unknown';
  const priority = priorityMap[priorityValue] || 'Unknown';
  const urgency = urgencyImpactMap[urgencyValue] || 'Unknown';
  const impact = urgencyImpactMap[impactValue] || 'Unknown';
  
  // Extract reference fields
  const assignmentGroup = extractValue(snIncident.assignment_group);
  const assignedTo = extractValue(snIncident.assigned_to);
  const reportedBy = extractValue(snIncident.caller_id);
  
  // Extract text fields (handles nested objects)
  const incidentId = extractValue(snIncident.number);
  const summary = extractValue(snIncident.short_description) || 'No summary provided';
  const description = extractValue(snIncident.description) || summary || 'No description';
  const category = extractValue(snIncident.category) || 'Uncategorized';
  const subcategory = extractValue(snIncident.subcategory);
  
  // Extract work notes and close notes
  const workNotes = extractValue(snIncident.work_notes || snIncident.comments_and_work_notes);
  const closeNotes = extractValue(snIncident.close_notes);
  
  // Extract dates
  const createdDate = extractValue(snIncident.opened_at || snIncident.sys_created_on);
  const updatedDate = extractValue(snIncident.sys_updated_on);
  const resolvedDate = extractValue(snIncident.resolved_at);
  const closedDate = extractValue(snIncident.closed_at);
  
  // Create searchable text
  const searchableText = [
    incidentId,
    summary,
    description,
    category,
    subcategory,
    status,
    priority,
    urgency,
    impact,
    workNotes,
    closeNotes,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    incidentId: { display_value: incidentId, value: incidentId },
    summary: { display_value: summary, value: summary },
    description: { display_value: description, value: description },
    
    urgency,
    impact,
    priority,
    status,
    
    category: category ? { display_value: category, value: category.toLowerCase() } : { display_value: null, value: '' },
    subcategory: subcategory ? { display_value: subcategory, value: subcategory.toLowerCase() } : { display_value: null, value: '' },
    
    assignmentGroup: assignmentGroup || undefined,
    assignedTo: assignedTo || undefined,
    reportedBy: reportedBy || undefined,
    
    createdDate: createdDate ? { display_value: createdDate, value: createdDate } : { display_value: '', value: '' },
    updatedDate: updatedDate ? { display_value: updatedDate, value: updatedDate } : { display_value: '', value: '' },
    resolvedDate: resolvedDate ? { display_value: resolvedDate, value: resolvedDate } : { display_value: '', value: '' },
    closedDate: closedDate ? { display_value: closedDate, value: closedDate } : { display_value: '', value: '' },
    
    rootCause: workNotes ? { display_value: workNotes, value: '' } : { display_value: '', value: '' },
    resolutionSteps: closeNotes ? { display_value: closeNotes, value: '' } : { display_value: '', value: '' },
    workNotes: workNotes ? { display_value: workNotes, value: '' } : { display_value: '', value: '' },
    
    searchableText,
  };
}

/**
 * Map multiple ServiceNow incidents
 */
export function mapServiceNowIncidents(snIncidents: ServiceNowIncident[]): MappedIncident[] {
  return snIncidents.map(mapServiceNowIncident);
}

/**
 * Get statistics about the incidents
 */
export function getIncidentStatistics(incidents: MappedIncident[]) {
  const stats = {
    total: incidents.length,
    byPriority: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byUrgency: {} as Record<string, number>,
    byImpact: {} as Record<string, number>,
  };

  incidents.forEach((incident) => {
    // Priority
    stats.byPriority[incident.priority] = (stats.byPriority[incident.priority] || 0) + 1;
    
    // Status
    stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
    
    // Category
    stats.byCategory[incident.category] = (stats.byCategory[incident.category] || 0) + 1;
    
    // Urgency
    stats.byUrgency[incident.urgency] = (stats.byUrgency[incident.urgency] || 0) + 1;
    
    // Impact
    stats.byImpact[incident.impact] = (stats.byImpact[incident.impact] || 0) + 1;
  });

  return stats;
}

