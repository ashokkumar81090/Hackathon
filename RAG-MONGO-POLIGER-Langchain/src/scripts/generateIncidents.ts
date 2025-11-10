/**
 * Generate additional incidents based on real ServiceNow data
 * This script creates realistic incident variations to reach the target count
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const REAL_INCIDENTS_FILE = path.join(DATA_DIR, 'servicenow_real.json');
const GENERATED_FILE = path.join(DATA_DIR, 'incidents_generated.json');
const FINAL_FILE = path.join(DATA_DIR, 'incidents_final.json');

// Configuration
const TARGET_TOTAL = 2000;

// Categories and variations
const CATEGORIES = [
  'Software',
  'Hardware',
  'Network',
  'Database',
  'Security',
  'Cloud Service',
  'Application',
  'Infrastructure',
  'Inquiry / Help',
  'Access Request',
  'Performance',
];

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Planning'];
const URGENCIES = ['High', 'Medium', 'Low'];
const IMPACTS = ['High', 'Medium', 'Low'];
const STATUSES = ['New', 'In Progress', 'On Hold', 'Resolved', 'Closed'];

const USERS = [
  'Beth Anglin', 'Fred Luddy', 'Don Goodliffe', 'Howard Johnson', 'ITIL User',
  'Bud Richman', 'Joe Employee', 'David Miller', 'Rob Phillips', 'System Administrator',
  'Carol Coughlin', 'Margaret Grey', 'Jerrod Bennett', 'Sam Sorokin', 'Charlie Whitherspoon',
  'Bow Ruggeri', 'Taylor Vreeland', 'Luke Wilson', 'Christen Mitchell', 'Rick Berzle',
  'Bertie Luby', 'David Loo', 'Sarah Chen', 'Mike Johnson', 'Lisa Anderson',
];

const ASSIGNMENT_GROUPS = [
  'Service Desk', 'Software', 'Hardware', 'Network', 'Database',
  'Security', 'Cloud Operations', 'Infrastructure', 'Application Support',
];

// Issue templates by category
const ISSUE_TEMPLATES = {
  Software: [
    { summary: '{app} application not responding', desc: 'The {app} application freezes when trying to {action}. Error message: {error}' },
    { summary: 'Unable to login to {app}', desc: 'Login credentials rejected for {app}. Password reset attempted but still unable to access.' },
    { summary: '{app} performance issues', desc: '{app} is running extremely slow. Takes {time} to {action}.' },
    { summary: '{app} crashing frequently', desc: '{app} crashes every {freq}. Losing unsaved work regularly.' },
    { summary: 'Cannot install {app}', desc: 'Installation of {app} fails with error code {code}. Tried multiple times.' },
  ],
  Hardware: [
    { summary: '{device} not working', desc: '{device} stopped functioning. {symptom}. Checked all connections.' },
    { summary: '{device} hardware failure', desc: '{device} showing signs of hardware failure: {symptom}' },
    { summary: 'Need replacement {device}', desc: 'Current {device} is {issue}. Request for immediate replacement.' },
    { summary: '{device} making unusual noise', desc: '{device} making {noise} sound. Concerned about potential failure.' },
    { summary: '{device} overheating', desc: '{device} running very hot. Temperature reached {temp}°C.' },
  ],
  Network: [
    { summary: 'Network connectivity issues in {location}', desc: 'Intermittent network drops in {location}. Affecting {count} users.' },
    { summary: 'Cannot access {resource} from {location}', desc: 'Network path to {resource} not found from {location}.' },
    { summary: 'VPN connection failing', desc: 'VPN drops every {time}. Error: {error}' },
    { summary: 'Slow network performance', desc: 'Network speed extremely slow. Download: {speed}Mbps (expected: {expected}Mbps).' },
    { summary: 'WiFi not available in {location}', desc: 'No WiFi signal detected in {location}. Multiple devices affected.' },
  ],
  Database: [
    { summary: '{db} database connection timeout', desc: 'Cannot connect to {db} database. Connection timeout after {time}s.' },
    { summary: '{db} database performance degradation', desc: '{db} queries taking {time}x longer than normal. {count} slow queries detected.' },
    { summary: 'Cannot access {db} database', desc: 'Access denied to {db}. Credentials verified but still blocked.' },
    { summary: '{db} database backup failed', desc: 'Scheduled backup for {db} failed. Error: {error}' },
    { summary: 'Data corruption in {db}', desc: 'Possible data corruption detected in {db} database table {table}.' },
  ],
  Security: [
    { summary: 'Suspicious activity detected on {system}', desc: 'Unusual login attempts on {system}. {count} failed attempts from {ip}.' },
    { summary: 'Access rights issue for {resource}', desc: 'User lacks required permissions for {resource}. Need {permission} access.' },
    { summary: 'Security certificate expired for {system}', desc: 'SSL certificate for {system} expired on {date}. Users cannot access.' },
    { summary: 'Potential malware detected', desc: 'Antivirus flagged {file} as potential threat. Need investigation.' },
    { summary: 'Account locked out - {user}', desc: 'Account {user} locked after {count} failed login attempts.' },
  ],
  'Cloud Service': [
    { summary: '{service} cloud service outage', desc: '{service} showing as unavailable. API returning {status} errors.' },
    { summary: 'Cannot access {service} dashboard', desc: '{service} dashboard not loading. Timeout after {time}s.' },
    { summary: '{service} sync issues', desc: 'Data not syncing to {service}. Last successful sync: {time} ago.' },
    { summary: '{service} performance degraded', desc: '{service} response times increased by {percent}%. SLA breached.' },
    { summary: 'Authentication failure with {service}', desc: 'Cannot authenticate with {service}. Token expired/invalid.' },
  ],
};

// Replacement values
const REPLACEMENTS = {
  app: ['SAP', 'Salesforce', 'Oracle', 'Teams', 'Zoom', 'Jira', 'Confluence', 'SharePoint', 'Outlook', 'Excel', 'PowerBI', 'Tableau'],
  device: ['Laptop', 'Desktop', 'Printer', 'Monitor', 'Server', 'Scanner', 'Phone', 'Headset', 'Keyboard', 'Mouse', 'Docking Station'],
  location: ['Building A Floor 3', 'Building B Floor 2', 'Data Center', 'Conference Room 401', 'Main Office', 'Remote Site', 'Branch Office'],
  resource: ['File Server', 'Print Server', 'Shared Drive', 'Application Server', 'Database Server', 'Web Server'],
  db: ['PostgreSQL', 'MySQL', 'MongoDB', 'Oracle', 'SQL Server', 'Redis', 'Cassandra'],
  system: ['Production Server', 'Staging Environment', 'Dev Server', 'Web Portal', 'API Gateway', 'Mail Server'],
  service: ['AWS S3', 'Azure AD', 'Google Workspace', 'Dropbox', 'OneDrive', 'Slack', 'GitHub', 'DocuSign'],
  action: ['open a file', 'save changes', 'export data', 'run a report', 'load the dashboard', 'process a transaction'],
  symptom: ['No display output', 'No power', 'No response to input', 'Intermittent failures', 'Blue screen errors'],
  error: ['0x80070002', '0x80004005', 'Connection refused', 'Access denied', 'Resource not found', 'Timeout expired'],
  issue: ['malfunctioning', 'too slow', 'outdated', 'damaged', 'incompatible with new software'],
  noise: ['clicking', 'grinding', 'beeping', 'whirring', 'buzzing'],
  time: ['30 seconds', '2 minutes', '5 minutes', '10 minutes', '15 minutes'],
  freq: ['10 minutes', '30 minutes', 'hour', 'few hours'],
  code: ['ERR_001', 'ERR_INSTALL_FAILED', '0x8007000D', 'INSTALL_ERROR_23'],
  count: ['5', '10', '15', '20', '25', '50'],
  speed: ['5', '10', '15', '20'],
  expected: ['100', '200', '500', '1000'],
  ip: ['192.168.1.100', '10.0.0.45', '172.16.0.20', 'Unknown IP'],
  permission: ['Read/Write', 'Admin', 'Full Control', 'Modify'],
  status: ['500', '503', '401', '403', '404'],
  percent: ['150', '200', '300', '400'],
  file: ['document.exe', 'update.msi', 'setup.bat', 'script.ps1'],
  user: ['john.doe', 'jane.smith', 'admin', 'service.account'],
  date: ['2025-10-01', '2025-09-15', '2025-11-30', 'yesterday'],
  table: ['users', 'transactions', 'logs', 'sessions', 'orders'],
  temp: ['85', '90', '95', '100'],
};

/**
 * Generate random element from array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Replace placeholders in template
 */
function fillTemplate(template: string): string {
  let result = template;
  const placeholders = template.match(/\{(\w+)\}/g);
  
  if (placeholders) {
    for (const placeholder of placeholders) {
      const key = placeholder.slice(1, -1) as keyof typeof REPLACEMENTS;
      if (REPLACEMENTS[key]) {
        result = result.replace(placeholder, randomChoice(REPLACEMENTS[key]));
      }
    }
  }
  
  return result;
}

/**
 * Generate random date between start and end
 */
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Generate work notes based on status
 */
function generateWorkNotes(status: string, category: string): string {
  const notes = [];
  const analyst = randomChoice(USERS);
  const date = randomDate(new Date('2025-09-01'), new Date('2025-11-06'));
  
  if (status === 'In Progress') {
    notes.push(`${date} - ${analyst} (Work notes)\nCurrently investigating the ${category.toLowerCase()} issue. Will provide update soon.\n\n`);
  } else if (status === 'Resolved' || status === 'Closed') {
    notes.push(`${date} - ${analyst} (Work notes)\nIssue resolved. ${randomChoice([
      'Applied latest patch.',
      'Restarted service.',
      'Cleared cache.',
      'Reconfigured settings.',
      'Replaced hardware.',
      'Updated drivers.',
      'Reset credentials.',
    ])}\n\n`);
  } else if (status === 'On Hold') {
    notes.push(`${date} - ${analyst} (Work notes)\nWaiting for ${randomChoice([
      'vendor response',
      'management approval',
      'scheduled maintenance window',
      'additional information from user',
      'parts delivery',
    ])}.\n\n`);
  }
  
  return notes.join('');
}

/**
 * Generate a single incident
 */
function generateIncident(index: number, startIncidentId: number): any {
  const incidentNumber = `INC${String(startIncidentId + index).padStart(7, '0')}`;
  const category = randomChoice(CATEGORIES);
  const categoryLower = category.toLowerCase().replace(/\s+/g, ' ');
  
  // Get template for category or use generic
  const templates = ISSUE_TEMPLATES[category as keyof typeof ISSUE_TEMPLATES] || ISSUE_TEMPLATES['Software'];
  const template = randomChoice(templates);
  
  const summary = fillTemplate(template.summary);
  const description = fillTemplate(template.desc);
  
  // Priority distribution (matching real-world patterns)
  const priorityRoll = Math.random();
  let priority, urgency, impact;
  
  if (priorityRoll < 0.15) {
    priority = 'Critical'; urgency = 'High'; impact = 'High';
  } else if (priorityRoll < 0.35) {
    priority = 'High'; urgency = randomChoice(['High', 'Medium']); impact = 'High';
  } else if (priorityRoll < 0.65) {
    priority = 'Medium'; urgency = 'Medium'; impact = randomChoice(['High', 'Medium']);
  } else if (priorityRoll < 0.85) {
    priority = 'Low'; urgency = randomChoice(['Medium', 'Low']); impact = randomChoice(['Medium', 'Low']);
  } else {
    priority = 'Planning'; urgency = 'Low'; impact = 'Low';
  }
  
  // Status distribution
  const statusRoll = Math.random();
  let status;
  if (statusRoll < 0.25) status = 'New';
  else if (statusRoll < 0.65) status = 'In Progress';
  else if (statusRoll < 0.75) status = 'On Hold';
  else if (statusRoll < 0.90) status = 'Resolved';
  else status = 'Closed';
  
  const assignmentGroup = category === 'Inquiry / Help' ? 'Service Desk' :
                          category === 'Access Request' ? 'Service Desk' :
                          randomChoice(ASSIGNMENT_GROUPS);
  
  const assignedTo = status !== 'New' ? randomChoice(USERS) : undefined;
  const reportedBy = randomChoice(USERS);
  
  const createdDate = randomDate(new Date('2024-01-01'), new Date('2025-11-01'));
  const updatedDate = randomDate(new Date(createdDate), new Date('2025-11-06'));
  
  let resolvedDate = '';
  let closedDate = '';
  
  if (status === 'Resolved') {
    resolvedDate = randomDate(new Date(updatedDate), new Date('2025-11-06'));
  } else if (status === 'Closed') {
    resolvedDate = randomDate(new Date(updatedDate), new Date('2025-11-05'));
    closedDate = randomDate(new Date(resolvedDate), new Date('2025-11-06'));
  }
  
  const workNotes = generateWorkNotes(status, category);
  const rootCause = (status === 'Resolved' || status === 'Closed') ? workNotes : '';
  const resolutionSteps = (status === 'Resolved' || status === 'Closed') ? 
    fillTemplate(randomChoice([
      'Applied patch version {code}',
      'Restarted {service} service',
      'Reconfigured {system} settings',
      'Replaced faulty {device}',
      'Updated {app} to latest version',
      'Cleared cache and temporary files',
    ])) : '';
  
  const searchableText = [
    incidentNumber,
    summary,
    description,
    category,
    status,
    priority,
    urgency,
    impact,
    workNotes,
    resolutionSteps,
  ].filter(Boolean).join(' ');
  
  return {
    incidentId: { display_value: incidentNumber, value: incidentNumber },
    summary: { display_value: summary, value: summary },
    description: { display_value: description, value: description },
    urgency,
    impact,
    priority,
    status,
    category: { display_value: category, value: categoryLower },
    subcategory: { display_value: null, value: '' },
    assignmentGroup,
    assignedTo,
    reportedBy,
    createdDate: { display_value: createdDate, value: createdDate },
    updatedDate: { display_value: updatedDate, value: updatedDate },
    resolvedDate: { display_value: resolvedDate, value: resolvedDate },
    closedDate: { display_value: closedDate, value: closedDate },
    rootCause: { display_value: rootCause, value: '' },
    resolutionSteps: { display_value: resolutionSteps, value: '' },
    workNotes: { display_value: workNotes, value: '' },
    searchableText,
  };
}

/**
 * Main generation function
 */
async function main() {
  console.log('🤖 AI Incident Generator');
  console.log('='.repeat(80));
  console.log();
  
  try {
    // Load real incidents
    console.log('📥 Loading real ServiceNow incidents...');
    const realIncidents = JSON.parse(fs.readFileSync(REAL_INCIDENTS_FILE, 'utf-8'));
    console.log(`✓ Loaded ${realIncidents.length} real incidents\n`);
    
    // Calculate how many to generate
    const toGenerate = TARGET_TOTAL - realIncidents.length;
    console.log(`🎯 Target: ${TARGET_TOTAL} total incidents`);
    console.log(`📊 Real incidents: ${realIncidents.length}`);
    console.log(`🔧 To generate: ${toGenerate}\n`);
    
    if (toGenerate <= 0) {
      console.log('✓ Already have enough incidents!');
      return;
    }
    
    // Generate incidents
    console.log('⚙️  Generating incidents...');
    const generatedIncidents = [];
    const batchSize = 100;
    
    for (let i = 0; i < toGenerate; i++) {
      generatedIncidents.push(generateIncident(i, 100000));
      
      if ((i + 1) % batchSize === 0 || i === toGenerate - 1) {
        process.stdout.write(`\r  Progress: ${i + 1}/${toGenerate} (${((i + 1) / toGenerate * 100).toFixed(1)}%)`);
      }
    }
    console.log('\n✓ Generation complete\n');
    
    // Calculate statistics
    console.log('📊 Generated Incident Statistics:');
    const stats = {
      priority: {} as Record<string, number>,
      status: {} as Record<string, number>,
      category: {} as Record<string, number>,
    };
    
    generatedIncidents.forEach(inc => {
      stats.priority[inc.priority] = (stats.priority[inc.priority] || 0) + 1;
      stats.status[inc.status] = (stats.status[inc.status] || 0) + 1;
      const cat = inc.category.display_value;
      stats.category[cat] = (stats.category[cat] || 0) + 1;
    });
    
    console.log('\n  Priority Distribution:');
    Object.entries(stats.priority).sort(([,a], [,b]) => b - a).forEach(([p, count]) => {
      console.log(`    ${p}: ${count} (${(count / toGenerate * 100).toFixed(1)}%)`);
    });
    
    console.log('\n  Status Distribution:');
    Object.entries(stats.status).sort(([,a], [,b]) => b - a).forEach(([s, count]) => {
      console.log(`    ${s}: ${count} (${(count / toGenerate * 100).toFixed(1)}%)`);
    });
    
    console.log('\n  Top 10 Categories:');
    Object.entries(stats.category).sort(([,a], [,b]) => b - a).slice(0, 10).forEach(([c, count]) => {
      console.log(`    ${c}: ${count} (${(count / toGenerate * 100).toFixed(1)}%)`);
    });
    
    // Merge with real incidents
    console.log('\n🔗 Merging with real incidents...');
    const finalIncidents = [...realIncidents, ...generatedIncidents];
    console.log(`✓ Total incidents: ${finalIncidents.length}`);
    
    // Save files
    console.log('\n💾 Saving files...');
    fs.writeFileSync(GENERATED_FILE, JSON.stringify(generatedIncidents, null, 2));
    console.log(`✓ Generated incidents saved to: ${GENERATED_FILE}`);
    
    fs.writeFileSync(FINAL_FILE, JSON.stringify(finalIncidents, null, 2));
    console.log(`✓ Final dataset saved to: ${FINAL_FILE}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS! Incident generation complete');
    console.log('='.repeat(80));
    console.log(`\n📁 Files Created:`);
    console.log(`  1. ${GENERATED_FILE} (${toGenerate} new incidents)`);
    console.log(`  2. ${FINAL_FILE} (${finalIncidents.length} total incidents)`);
    console.log(`\n📝 Next Steps:`);
    console.log(`  1. Review the generated incidents in ${path.basename(FINAL_FILE)}`);
    console.log(`  2. Run: npm run ingest (to load into MongoDB)`);
    console.log(`  3. Test your RAG system with the new diverse dataset!`);
    console.log();
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

