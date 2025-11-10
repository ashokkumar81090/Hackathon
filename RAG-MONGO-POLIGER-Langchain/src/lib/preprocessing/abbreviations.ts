/**
 * IT Service Industry Abbreviations Dictionary
 * Common abbreviations used in IT support, infrastructure, and service management
 */

export interface AbbreviationEntry {
  abbreviation: string;
  expansion: string;
  category: string;
}

/**
 * Comprehensive IT abbreviations dictionary
 */
export const IT_ABBREVIATIONS: Record<string, AbbreviationEntry> = {
  // Networking & Infrastructure
  "DNS": { abbreviation: "DNS", expansion: "Domain Name System", category: "Networking" },
  "DHCP": { abbreviation: "DHCP", expansion: "Dynamic Host Configuration Protocol", category: "Networking" },
  "IP": { abbreviation: "IP", expansion: "Internet Protocol", category: "Networking" },
  "TCP": { abbreviation: "TCP", expansion: "Transmission Control Protocol", category: "Networking" },
  "UDP": { abbreviation: "UDP", expansion: "User Datagram Protocol", category: "Networking" },
  "VPN": { abbreviation: "VPN", expansion: "Virtual Private Network", category: "Networking" },
  "LAN": { abbreviation: "LAN", expansion: "Local Area Network", category: "Networking" },
  "WAN": { abbreviation: "WAN", expansion: "Wide Area Network", category: "Networking" },
  "NAT": { abbreviation: "NAT", expansion: "Network Address Translation", category: "Networking" },
  "VLAN": { abbreviation: "VLAN", expansion: "Virtual Local Area Network", category: "Networking" },
  "CDN": { abbreviation: "CDN", expansion: "Content Delivery Network", category: "Networking" },
  "SSL": { abbreviation: "SSL", expansion: "Secure Sockets Layer", category: "Security" },
  "TLS": { abbreviation: "TLS", expansion: "Transport Layer Security", category: "Security" },
  "HTTPS": { abbreviation: "HTTPS", expansion: "Hypertext Transfer Protocol Secure", category: "Networking" },
  "HTTP": { abbreviation: "HTTP", expansion: "Hypertext Transfer Protocol", category: "Networking" },
  "FTP": { abbreviation: "FTP", expansion: "File Transfer Protocol", category: "Networking" },
  "SFTP": { abbreviation: "SFTP", expansion: "Secure File Transfer Protocol", category: "Networking" },
  "SSH": { abbreviation: "SSH", expansion: "Secure Shell", category: "Security" },
  
  // Databases
  "DB": { abbreviation: "DB", expansion: "Database", category: "Database" },
  "DBMS": { abbreviation: "DBMS", expansion: "Database Management System", category: "Database" },
  "RDBMS": { abbreviation: "RDBMS", expansion: "Relational Database Management System", category: "Database" },
  "SQL": { abbreviation: "SQL", expansion: "Structured Query Language", category: "Database" },
  "NoSQL": { abbreviation: "NoSQL", expansion: "Not Only SQL", category: "Database" },
  "ACID": { abbreviation: "ACID", expansion: "Atomicity Consistency Isolation Durability", category: "Database" },
  "ORM": { abbreviation: "ORM", expansion: "Object Relational Mapping", category: "Database" },
  
  // Web & APIs
  "API": { abbreviation: "API", expansion: "Application Programming Interface", category: "Development" },
  "REST": { abbreviation: "REST", expansion: "Representational State Transfer", category: "Development" },
  "SOAP": { abbreviation: "SOAP", expansion: "Simple Object Access Protocol", category: "Development" },
  "JSON": { abbreviation: "JSON", expansion: "JavaScript Object Notation", category: "Development" },
  "XML": { abbreviation: "XML", expansion: "Extensible Markup Language", category: "Development" },
  "AJAX": { abbreviation: "AJAX", expansion: "Asynchronous JavaScript and XML", category: "Development" },
  "CORS": { abbreviation: "CORS", expansion: "Cross-Origin Resource Sharing", category: "Development" },
  "JWT": { abbreviation: "JWT", expansion: "JSON Web Token", category: "Security" },
  "OAuth": { abbreviation: "OAuth", expansion: "Open Authorization", category: "Security" },
  "SAML": { abbreviation: "SAML", expansion: "Security Assertion Markup Language", category: "Security" },
  "SSO": { abbreviation: "SSO", expansion: "Single Sign-On", category: "Security" },
  
  // Cloud & DevOps
  "AWS": { abbreviation: "AWS", expansion: "Amazon Web Services", category: "Cloud" },
  "EC2": { abbreviation: "EC2", expansion: "Elastic Compute Cloud", category: "Cloud" },
  "S3": { abbreviation: "S3", expansion: "Simple Storage Service", category: "Cloud" },
  "RDS": { abbreviation: "RDS", expansion: "Relational Database Service", category: "Cloud" },
  "IAM": { abbreviation: "IAM", expansion: "Identity and Access Management", category: "Security" },
  "VM": { abbreviation: "VM", expansion: "Virtual Machine", category: "Infrastructure" },
  "CI": { abbreviation: "CI", expansion: "Continuous Integration", category: "DevOps" },
  "CD": { abbreviation: "CD", expansion: "Continuous Deployment", category: "DevOps" },
  "CI/CD": { abbreviation: "CI/CD", expansion: "Continuous Integration/Continuous Deployment", category: "DevOps" },
  "IaC": { abbreviation: "IaC", expansion: "Infrastructure as Code", category: "DevOps" },
  "SaaS": { abbreviation: "SaaS", expansion: "Software as a Service", category: "Cloud" },
  "PaaS": { abbreviation: "PaaS", expansion: "Platform as a Service", category: "Cloud" },
  "IaaS": { abbreviation: "IaaS", expansion: "Infrastructure as a Service", category: "Cloud" },
  
  // Operating Systems
  "OS": { abbreviation: "OS", expansion: "Operating System", category: "System" },
  "CLI": { abbreviation: "CLI", expansion: "Command Line Interface", category: "System" },
  "GUI": { abbreviation: "GUI", expansion: "Graphical User Interface", category: "System" },
  "BIOS": { abbreviation: "BIOS", expansion: "Basic Input Output System", category: "System" },
  "UEFI": { abbreviation: "UEFI", expansion: "Unified Extensible Firmware Interface", category: "System" },
  
  // Performance & Monitoring
  "CPU": { abbreviation: "CPU", expansion: "Central Processing Unit", category: "Hardware" },
  "RAM": { abbreviation: "RAM", expansion: "Random Access Memory", category: "Hardware" },
  "ROM": { abbreviation: "ROM", expansion: "Read Only Memory", category: "Hardware" },
  "SSD": { abbreviation: "SSD", expansion: "Solid State Drive", category: "Hardware" },
  "HDD": { abbreviation: "HDD", expansion: "Hard Disk Drive", category: "Hardware" },
  "I/O": { abbreviation: "I/O", expansion: "Input/Output", category: "System" },
  "IOPS": { abbreviation: "IOPS", expansion: "Input/Output Operations Per Second", category: "Performance" },
  "QPS": { abbreviation: "QPS", expansion: "Queries Per Second", category: "Performance" },
  "RPS": { abbreviation: "RPS", expansion: "Requests Per Second", category: "Performance" },
  "TTL": { abbreviation: "TTL", expansion: "Time To Live", category: "System" },
  "RPO": { abbreviation: "RPO", expansion: "Recovery Point Objective", category: "DR" },
  "RTO": { abbreviation: "RTO", expansion: "Recovery Time Objective", category: "DR" },
  
  // ITIL & Service Management
  "ITIL": { abbreviation: "ITIL", expansion: "Information Technology Infrastructure Library", category: "ITSM" },
  "ITSM": { abbreviation: "ITSM", expansion: "IT Service Management", category: "ITSM" },
  "SLA": { abbreviation: "SLA", expansion: "Service Level Agreement", category: "ITSM" },
  "SLO": { abbreviation: "SLO", expansion: "Service Level Objective", category: "ITSM" },
  "SLI": { abbreviation: "SLI", expansion: "Service Level Indicator", category: "ITSM" },
  "CMDB": { abbreviation: "CMDB", expansion: "Configuration Management Database", category: "ITSM" },
  "MTTR": { abbreviation: "MTTR", expansion: "Mean Time To Repair", category: "ITSM" },
  "MTBF": { abbreviation: "MTBF", expansion: "Mean Time Between Failures", category: "ITSM" },
  "P1": { abbreviation: "P1", expansion: "Priority 1 (Critical)", category: "ITSM" },
  "P2": { abbreviation: "P2", expansion: "Priority 2 (High)", category: "ITSM" },
  "P3": { abbreviation: "P3", expansion: "Priority 3 (Medium)", category: "ITSM" },
  "P4": { abbreviation: "P4", expansion: "Priority 4 (Low)", category: "ITSM" },
  
  // Security
  "MFA": { abbreviation: "MFA", expansion: "Multi-Factor Authentication", category: "Security" },
  "2FA": { abbreviation: "2FA", expansion: "Two-Factor Authentication", category: "Security" },
  "DDoS": { abbreviation: "DDoS", expansion: "Distributed Denial of Service", category: "Security" },
  "DoS": { abbreviation: "DoS", expansion: "Denial of Service", category: "Security" },
  "XSS": { abbreviation: "XSS", expansion: "Cross-Site Scripting", category: "Security" },
  "CSRF": { abbreviation: "CSRF", expansion: "Cross-Site Request Forgery", category: "Security" },
  "SQL Injection": { abbreviation: "SQL Injection", expansion: "Structured Query Language Injection", category: "Security" },
  "ACL": { abbreviation: "ACL", expansion: "Access Control List", category: "Security" },
  "RBAC": { abbreviation: "RBAC", expansion: "Role-Based Access Control", category: "Security" },
  "PKI": { abbreviation: "PKI", expansion: "Public Key Infrastructure", category: "Security" },
  "CA": { abbreviation: "CA", expansion: "Certificate Authority", category: "Security" },
  
  // Development & Programming
  "IDE": { abbreviation: "IDE", expansion: "Integrated Development Environment", category: "Development" },
  "SDK": { abbreviation: "SDK", expansion: "Software Development Kit", category: "Development" },
  "JDK": { abbreviation: "JDK", expansion: "Java Development Kit", category: "Development" },
  "JRE": { abbreviation: "JRE", expansion: "Java Runtime Environment", category: "Development" },
  "JVM": { abbreviation: "JVM", expansion: "Java Virtual Machine", category: "Development" },
  "MVC": { abbreviation: "MVC", expansion: "Model View Controller", category: "Development" },
  "CRUD": { abbreviation: "CRUD", expansion: "Create Read Update Delete", category: "Development" },
  "DRY": { abbreviation: "DRY", expansion: "Don't Repeat Yourself", category: "Development" },
  "SOLID": { abbreviation: "SOLID", expansion: "Single Responsibility Open/Closed Liskov Substitution Interface Segregation Dependency Inversion", category: "Development" },
  
  // Backup & Recovery
  "DR": { abbreviation: "DR", expansion: "Disaster Recovery", category: "DR" },
  "BCP": { abbreviation: "BCP", expansion: "Business Continuity Plan", category: "DR" },
  "HA": { abbreviation: "HA", expansion: "High Availability", category: "Infrastructure" },
  
  // Protocols & Standards
  "SMTP": { abbreviation: "SMTP", expansion: "Simple Mail Transfer Protocol", category: "Networking" },
  "IMAP": { abbreviation: "IMAP", expansion: "Internet Message Access Protocol", category: "Networking" },
  "POP3": { abbreviation: "POP3", expansion: "Post Office Protocol version 3", category: "Networking" },
  "LDAP": { abbreviation: "LDAP", expansion: "Lightweight Directory Access Protocol", category: "Networking" },
  "SNMP": { abbreviation: "SNMP", expansion: "Simple Network Management Protocol", category: "Monitoring" },
  "NTP": { abbreviation: "NTP", expansion: "Network Time Protocol", category: "Networking" },
  "ICMP": { abbreviation: "ICMP", expansion: "Internet Control Message Protocol", category: "Networking" },
  
  // Other Common Terms
  "URL": { abbreviation: "URL", expansion: "Uniform Resource Locator", category: "Web" },
  "URI": { abbreviation: "URI", expansion: "Uniform Resource Identifier", category: "Web" },
  "UI": { abbreviation: "UI", expansion: "User Interface", category: "Development" },
  "UX": { abbreviation: "UX", expansion: "User Experience", category: "Development" },
  "QA": { abbreviation: "QA", expansion: "Quality Assurance", category: "Testing" },
  "UAT": { abbreviation: "UAT", expansion: "User Acceptance Testing", category: "Testing" },
  "POC": { abbreviation: "POC", expansion: "Proof of Concept", category: "Project" },
  "MVP": { abbreviation: "MVP", expansion: "Minimum Viable Product", category: "Project" },
  "ETA": { abbreviation: "ETA", expansion: "Estimated Time of Arrival", category: "Project" },
  "EOD": { abbreviation: "EOD", expansion: "End of Day", category: "Project" },
  "ASAP": { abbreviation: "ASAP", expansion: "As Soon As Possible", category: "General" },
};

/**
 * Expand abbreviations in a query string
 */
export function expandAbbreviations(query: string): {
  expanded: string;
  expansions: Array<{ original: string; expanded: string; category: string }>;
} {
  let expanded = query;
  const expansions: Array<{ original: string; expanded: string; category: string }> = [];

  // Sort by length (longest first) to handle multi-word abbreviations
  const sortedAbbrevs = Object.keys(IT_ABBREVIATIONS).sort((a, b) => b.length - a.length);

  for (const abbrev of sortedAbbrevs) {
    const entry = IT_ABBREVIATIONS[abbrev];
    
    // Create regex for whole word matching (case insensitive)
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    
    if (regex.test(query)) {
      // Replace with expanded form
      expanded = expanded.replace(regex, `${abbrev} (${entry.expansion})`);
      
      // Track what was expanded
      if (!expansions.some(e => e.original === abbrev)) {
        expansions.push({
          original: abbrev,
          expanded: entry.expansion,
          category: entry.category,
        });
      }
    }
  }

  return { expanded, expansions };
}

/**
 * Get search-friendly expansion (for embedding)
 * This version includes both abbreviation and expansion without parentheses
 */
export function getSearchExpansion(query: string): string {
  let expanded = query;

  const sortedAbbrevs = Object.keys(IT_ABBREVIATIONS).sort((a, b) => b.length - a.length);

  for (const abbrev of sortedAbbrevs) {
    const entry = IT_ABBREVIATIONS[abbrev];
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    
    if (regex.test(query)) {
      // Replace with both forms for better search
      expanded = expanded.replace(regex, `${abbrev} ${entry.expansion}`);
    }
  }

  return expanded;
}

/**
 * Get all abbreviations found in a query
 */
export function findAbbreviations(query: string): AbbreviationEntry[] {
  const found: AbbreviationEntry[] = [];
  const upperQuery = query.toUpperCase();

  for (const [abbrev, entry] of Object.entries(IT_ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'i');
    if (regex.test(upperQuery)) {
      found.push(entry);
    }
  }

  return found;
}

