/**
 * =========================================================================================
 * @file src/types.ts
 * @description Central Data Models & TypeScript Definitions for Walton Quality Management System
 * =========================================================================================
 *
 * FOR BEGINNERS:
 * --------------
 * In TypeScript, types and interfaces define the exact "shape" of data used across the app.
 * Having explicit types prevents bugs (like misspelling a property name or passing a string
 * where a number is expected) and ensures clean autocomplete support in code editors.
 */

/**
 * PageId & PageType
 * -----------------
 * Union of all available page identifiers in the Walton QMS web application.
 * - 'home': Public landing showcase page
 * - 'dashboard': Executive quality metrics & yield dashboard
 * - 'leaders': Quality leadership directory & responsibilities
 * - 'pcb': PCB fabrication yield & defect tracking
 * - 'pcb-process': Visual PCB fabrication step-by-step flowchart
 * - 'pcba': PCBA SMT & MI surface mount quality metrics
 * - 'pcba-process': Visual PCBA assembly line workflow
 * - 'quality-dev': Quality development & continual improvement programs
 * - 'tasks': Plant action tracker & task management
 * - 'research': Six Sigma & AI optical vision research publications
 * - 'kpi': Key Performance Indicator scorecards
 * - 'nc': Non-Conformance Reports (NCR) registry
 * - 'capa': Corrective and Preventive Actions (CAPA) tracking
 * - 'complaints': Customer complaint & field failure management
 * - 'docs': Standard Operating Procedures (SOP) & Quality Manuals
 * - 'team': Operational inspector rosters & training logs
 * - 'settings': System configuration & audit preferences
 */
export type PageId =
  | 'home'
  | 'dashboard'
  | 'leaders'
  | 'pcb'
  | 'pcb-process'
  | 'iqc'
  | 'iqc-pcb'
  | 'iqc-pcba'
  | 'rca'
  | 'pcba'
  | 'pcba-process'
  | 'quality-dev'
  | 'tasks'
  | 'research'
  | 'kpi'
  | 'nc'
  | 'capa'
  | 'complaints'
  | 'docs'
  | 'team'
  | 'settings';

export type PageType = PageId;

/**
 * Department Interface
 * Represents an organizational quality unit (e.g., TQM, QA, QC, R&D).
 */
export interface Department {
  id: string;
  name: string;
  desc: string;
  color: string;
  iconName: string;
  focusArea: string;
  headCount: number;
}

/**
 * WorkerKpi Interface
 * Tracks monthly scorecards and evaluations for shop-floor operators and inspectors.
 */
export interface WorkerKpi {
  id: string;
  name: string;
  employeeId: string;
  attendance: number;
  compliance: number;
  dailyTarget: number;
  defectId: number;
  sop: number;
  score: number;
  rank: number;
  line: string;
  role: string;
}

export interface NonConformanceItem {
  id: string;
  code: string;
  title: string;
  date: string;
  line: string;
  classification: 'Major' | 'Minor' | 'Critical';
  status: 'Open' | 'In Progress' | 'Closed' | 'Draft';
  product: string;
  defectType: string;
  quantityAffected: number;
  reportedBy: string;
  description: string;
  containmentAction?: string;
}

export interface CapaItem {
  id: string;
  code: string;
  title: string;
  source: 'NCR' | 'Customer Complaint' | 'Internal Audit' | 'Supplier Issue' | 'Process Deviation' | 'Mgmt Review' | 'Other';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Pending Verification' | 'Closed' | 'Cancelled';
  owner: string;
  dueDate: string;
  createdDate: string;
  rootCause: string;
  actionPlan: string;
  progressPercent: number;
}

export interface CustomerComplaint {
  id: string;
  ticketNo: string;
  customerName: string;
  accountTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  npsScore: number;
  npsCategory: 'Detractor' | 'Passive' | 'Promoter';
  productCategory: 'PCB' | 'PCBA' | 'Component' | 'Finished Module';
  modelNo: string;
  lotBatchNo: string;
  defectCategory: string;
  severity: 'Critical' | 'Major' | 'Minor';
  receivedDate: string;
  targetDate: string;
  status: 'Open' | 'Under Investigation' | 'Containment Active' | 'CAPA Initiated' | 'RCA In Progress' | 'Resolved' | 'Closed';
  deliveryQty: number;
  defectQty: number;
  defectRate: number;
  customerFeedback: string;
  containmentAction: string;
  rootCauseAnalysis?: string;
  preventiveAction?: string;
  assignedEngineer: string;
  capaRef?: string;
  rcaRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SopDocument {
  id: string;
  code: string;
  title: string;
  category: 'IQC' | 'SMT' | 'AOI' | 'Wave Soldering' | 'Final QC' | 'ESD & Safety' | 'R&D';
  revision: string;
  effectiveDate: string;
  status: 'Active' | 'Under Review' | 'Draft' | 'Archived';
  owner: string;
  remarks: string;
  fileSize: string;
}

export interface TrainingRecord {
  id: string;
  title: string;
  trainer: string;
  type: 'Online' | 'Practical' | 'External' | 'Internal';
  department: string;
  participants: number;
  durationMinutes: number;
  status: 'Not Started' | 'In-Progress' | 'Completed';
  rating: 'Excellent' | 'Good' | 'Average';
  date: string;
}

export interface PcbProductData {
  product: string;
  checkQty: number;
  faultQty: number;
  faultRate: number;
}

export interface PcbaProductData {
  product: string;
  checkedQty: number;
  failQty: number;
  failRate: number;
}
