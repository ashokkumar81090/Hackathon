/**
 * ServiceNow Incident Types
 */

export interface ServiceNowIncident {
  number: string;
  sys_id: string;
  short_description: string;
  description: string;
  
  // Priority calculation fields
  urgency: '1' | '2' | '3';           // 1=High, 2=Medium, 3=Low
  impact: '1' | '2' | '3';            // 1=High, 2=Medium, 3=Low
  priority: '1' | '2' | '3' | '4';    // 1=Critical, 2=High, 3=Medium, 4=Low
  
  // State field
  state: '1' | '2' | '3' | '6' | '7' | '8'; // 1=New, 2=In Progress, 3=On Hold, 6=Resolved, 7=Closed, 8=Canceled
  
  // Categorization
  category: string;
  subcategory: string;
  
  // Assignment
  assignment_group: {
    value: string;
    link: string;
    display_value: string;
  } | string;
  assigned_to: {
    value: string;
    link: string;
    display_value: string;
  } | string;
  
  // Caller
  caller_id: {
    value: string;
    link: string;
    display_value: string;
  } | string;
  
  // Timestamps
  opened_at: string;
  sys_created_on: string;
  sys_updated_on: string;
  resolved_at?: string;
  closed_at?: string;
  
  // Resolution fields
  close_notes?: string;
  work_notes?: string;
  resolution_code?: string;
  
  // Additional fields
  active: string | boolean;
  incident_state?: string;
  severity?: '1' | '2' | '3';
  comments?: string;
  comments_and_work_notes?: string;
}

export interface ServiceNowResponse<T> {
  result: T[];
}

export interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
  apiVersion?: string;
}

export interface FetchIncidentsOptions {
  limit?: number;
  offset?: number;
  query?: string;
  fields?: string[];
  orderBy?: string;
}

/**
 * Mapped incident type for our system
 */
export interface MappedIncident {
  incidentId: string;
  summary: string;
  description: string;
  
  urgency: string;
  impact: string;
  priority: string;
  status: string;
  
  category: string;
  subcategory?: string;
  
  assignmentGroup?: string;
  assignedTo?: string;
  reportedBy?: string;
  
  createdDate: string;
  updatedDate: string;
  resolvedDate?: string;
  closedDate?: string;
  
  rootCause?: string;
  resolutionSteps?: string;
  workNotes?: string;
  
  searchableText: string;
}

