/**
 * =========================================================================================
 * @file src/components/views/ResearchView.tsx
 * @component ResearchView
 * @description Advanced Quality Engineering, Six Sigma & AI Vision Research Publications
 * =========================================================================================
 *
 * WHAT THIS COMPONENT DOES:
 * -------------------------
 * Showcases peer-reviewed manufacturing quality studies and empirical papers authored by
 * Walton Hi-Tech Industries quality research teams, including:
 * 1. AI-Based Visual Inspection for PCBA Quality Assurance (PyTorch, Deep Learning Optical Vision).
 * 2. Process FMEA Execution for Surface Mount Technology (AIAG-VDA Harmonized).
 * 3. Reliability Physics & Thermal Profiling under tropical humidity stress testing.
 * 4. Six Sigma DMAIC optimization of wave soldering through-hole defects.
 * 5. ISO 9001:2015 & IATF 16949 QMS Governance and audit readiness.
 *
 * WHERE GEMINI AI API IS INTEGRATED & APPLIED:
 * --------------------------------------------
 * Topic #2 specifically documents the AI Vision and Defect Recognition pipeline. The Gemini
 * AI integration in `src/services/geminiService.ts` assists engineers by ingesting inspection
 * defect images/notes and generating automated IPC-A-610 compliant corrective action recommendations.
 *
 * PARAMETERS / PROPS:
 * -------------------
 * @param {(page: PageId) => void} [onNavigate] - Navigation handler to switch between views.
 */

import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  BarChart3,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText,
  Activity,
  AlertTriangle,
  Flame,
  Binary,
  Maximize2,
  X,
  BookOpen,
  Award,
  Sliders,
  Eye,
} from 'lucide-react';

export interface QMResearchTopic {
  id: number;
  title: string;
  category: 'Process Optimization' | 'Vision & AI' | 'Reliability & Physics' | 'Statistical Quality' | 'Standards & Governance';
  status: 'Field Validation' | 'Active Implementation' | 'Ongoing Pilot' | 'Published';
  leadAuthor: string;
  department: string;
  timeframe: string;
  featured?: boolean;
  abstract: string;
  problemStatement: string;
  methodology: string;
  toolsUsed: string[];
  ipcStandard: string;
  targetMetrics: {
    metric: string;
    baseline: string;
    target: string;
    achieved: string;
  }[];
  keyFindings: string[];
  practicalApplication: string;
}

export const QM_RESEARCH_TOPICS: QMResearchTopic[] = [
  {
    id: 1,
    title: 'Solder Paste Quality and Printing Optimization',
    category: 'Process Optimization',
    status: 'Active Implementation',
    leadAuthor: 'Engr. Quality Assurance R&D',
    department: 'SMT Technology & Process Engineering',
    timeframe: 'Q1 2026 - Present',
    featured: false,
    abstract: 'Investigation into stencil aperture area ratios, squeegee pressure, print speed dynamics, and rheological degradation of SAC305 lead-free solder paste under tropical temperature/humidity variations to eliminate bridging and insufficient volume.',
    problemStatement: 'Over 65% of PCBA soldering defects originate during the stencil printing phase due to paste slump, uneven aperture release, and ambient humidity-induced solder balling.',
    methodology: 'Taguchi L9 Orthogonal Array Design of Experiments (DOE) evaluating squeegee angles (45° vs 60°), separation speeds (0.1 to 1.0 mm/s), and wiper cleaning frequencies (wet-vacuum-dry cycles).',
    toolsUsed: ['Koh Young 3D SPI', 'Malvern Bohlin Rheometer', 'Minitab 21', 'Nano-coated Laser Stencils'],
    ipcStandard: 'IPC-7527 / IPC-J-STD-005A',
    targetMetrics: [
      { metric: 'Volume Transfer Efficiency (VTE)', baseline: '74.2%', target: '> 88.0%', achieved: '91.4%' },
      { metric: 'Height Cpk', baseline: '1.18', target: '> 1.67', achieved: '1.72' },
      { metric: 'Solder Bridging Defects', baseline: '142 PPM', target: '< 30 PPM', achieved: '22 PPM' },
    ],
    keyFindings: [
      'Nano-coated electro-formed stencils enhanced paste release efficiency by 18.3% on 0.4mm pitch BGA and 0201 chip pads.',
      'Squeegee speed reduction from 45 mm/s to 28 mm/s stabilized paste roll geometry and eliminated paste scooping on large pads.',
      'Under-stencil vacuum-assisted solvent wipe interval locked at every 3 panels prevented micro-bridging accumulation.',
    ],
    practicalApplication: 'Standard operating printing profiles rolled out across all 12 SMT lines at Walton SMT Complex.',
  },
  {
    id: 2,
    title: 'Defect Reduction through AOI and SPI Data Analysis',
    category: 'Vision & AI',
    status: 'Active Implementation',
    leadAuthor: 'Process Analytics QM Division',
    department: 'Quality Management & SMT Analytics',
    timeframe: 'Q4 2025 - Q2 2026',
    featured: true,
    abstract: 'Cross-correlating upstream 3D Solder Paste Inspection (SPI) volumetric measurements with downstream Post-Reflow 3D Automated Optical Inspection (AOI) coordinates to establish predictive defect threshold models and root-cause tracing.',
    problemStatement: 'Siloed data between SPI and AOI inspection stations delayed defect identification, leading to high false-alarm rates and uncontained component tombstoning/misalignment escapes.',
    methodology: 'Closed-loop data feedback integration utilizing IPC-Hermes-9852 and IPC-CFX protocols. Big data clustering of 1.4 million component solder points to calculate multivariate correlation regressions between paste volume and reflow joint wetting.',
    toolsUsed: ['Koh Young KSMART', 'Saki 3D AOI', 'Python Pandas/Scikit-Learn', 'IPC-CFX Broker'],
    ipcStandard: 'IPC-A-610H Class 3 / IPC-CFX-2591',
    targetMetrics: [
      { metric: 'Overall DPMO', baseline: '480 DPMO', target: '< 180 DPMO', achieved: '135 DPMO' },
      { metric: 'AOI False Alarm Rate', baseline: '320 PPM', target: '< 60 PPM', achieved: '48 PPM' },
      { metric: 'Closed-Loop Correction Time', baseline: '45 mins', target: '< 2 mins', achieved: 'Instant Auto-adjust' },
    ],
    keyFindings: [
      'Identified that paste volume deviation between paired pads of > 22% is the direct root cause of 94% of capacitor tombstoning events.',
      'Closed-loop auto-offset correction from SPI to screen printer reduced XY print placement drift from 35 µm to 8 µm.',
      'Dual-station unified data modeling dropped operator verification load by 68% without any escape risk.',
    ],
    practicalApplication: 'Automated real-time IPC-CFX feedback link implemented between DEK Stencil Printers and Koh Young SPI units.',
  },
  {
    id: 3,
    title: 'PCBA Process Capability Improvement Using SPC',
    category: 'Statistical Quality',
    status: 'Published',
    leadAuthor: 'Senior Statistical Engineer',
    department: 'Continuous Improvement & Six Sigma Cell',
    timeframe: 'Q3 2025 - Q1 2026',
    featured: false,
    abstract: 'Implementation of advanced Statistical Process Control (SPC) charting—including X-bar R charts, EWMA, and pre-control charts—on critical SMT parameters: reflow peak temperature, solder paste deposit height, and wave solder immersion depth.',
    problemStatement: 'Reactive troubleshooting of soldering defects resulted in delayed quarantine actions and recurring sporadic shifts in solder fillet formation.',
    methodology: 'Phase I baseline capability assessment across 10 high-runner boards. Phase II root-cause variance partitioning using ANOVA. Phase III deployment of automated real-time Western Electric Rule alert triggers.',
    toolsUsed: ['Minitab Statistical Software', 'Datapaq Reflow Tracker', 'SPC Vision Suite', 'MES Quality Gate'],
    ipcStandard: 'IPC-9191 / ANSI/ASQ Z1.4',
    targetMetrics: [
      { metric: 'Process Capability (Cpk)', baseline: '1.14', target: '> 1.67', achieved: '1.74' },
      { metric: 'Process Stability (Ppk)', baseline: '1.02', target: '> 1.50', achieved: '1.61' },
      { metric: 'Out-of-Control Incidents', baseline: '18 / month', target: '< 2 / month', achieved: '1 / month' },
    ],
    keyFindings: [
      'Reflow Zone 5 heater thermocouple drift accounted for 42% of unexplained solder ball variations.',
      'EWMA charts detected thermal gradient anomalies 3 hours before standard Shewhart charts violated 3-sigma control limits.',
      'Standardized daily verification of solder paste dispenser volume boosted Cpk on dispensing from 1.08 to 1.76.',
    ],
    practicalApplication: 'Live SPC dashboards operating at each SMT line master console with automated line-stop alarms.',
  },
  {
    id: 4,
    title: 'Failure Mode and Effects Analysis (FMEA) for PCBA Manufacturing',
    category: 'Standards & Governance',
    status: 'Active Implementation',
    leadAuthor: 'Risk Management Taskforce',
    department: 'Quality Assurance & New Product Introduction (NPI)',
    timeframe: 'Q1 2026 - Ongoing',
    featured: true,
    abstract: 'Comprehensive AIAG-VDA harmonized Process FMEA execution covering the entire PCBA assembly sequence from incoming material receipt to final functional burn-in testing to systematically drive down Risk Priority Numbers (RPN).',
    problemStatement: 'Occasional unanticipated field failures and NPI ramp-up defects indicated gaps in proactive risk containment during new PCBA board spin releases.',
    methodology: 'Cross-functional team assessment (Quality, SMT, Design, Maintenance) decomposing 28 manufacturing steps. Evaluation of Severity (S), Occurrence (O), and Detection (D) scoring per AIAG-VDA standards with targeted Action Priority (AP) assignments.',
    toolsUsed: ['APIS IQ-FMEA', 'MES Defect Pareto', 'Fishbone / 5-Why Matrix', 'Walton PLM Portal'],
    ipcStandard: 'AIAG & VDA FMEA / IPC-A-610 Class 3',
    targetMetrics: [
      { metric: 'Highest Process RPN', baseline: '384', target: '< 100', achieved: '72' },
      { metric: 'High Action Priority (AP) Risks', baseline: '24 Identified', target: '0 High AP', achieved: '0 High AP' },
      { metric: 'NPI First-Pass Yield (FPY)', baseline: '91.8%', target: '> 98.0%', achieved: '98.6%' },
    ],
    keyFindings: [
      'Through-hole wave solder pallet orientation was identified as the highest severity risk for thermal bridging on high-mass connectors.',
      'Installing poke-yoke automated fixture clamps eliminated wrong connector polarity risks completely (Occurrence dropped from 6 to 1).',
      'Implemented mandatory MSL moisture sensor interlocking at SMT feeders to nullify popcorning risks on QFN packages.',
    ],
    practicalApplication: 'Standardized PFMEA living documents integrated into ISO 9001:2015 change management workflows.',
  },
  {
    id: 5,
    title: 'AI-Based Visual Inspection for PCBA Quality Assurance',
    category: 'Vision & AI',
    status: 'Field Validation',
    leadAuthor: 'AI Vision & Automation Laboratory',
    department: 'Smart Manufacturing & Computer Vision R&D',
    timeframe: 'Q2 2025 - Q3 2026',
    featured: true,
    abstract: 'Development of an edge-computing Deep Convolutional Neural Network (YOLOv9 + Custom ResNet-50 Feature Pyramid) trained on 250,000 annotated Walton PCBA defect images to automate secondary manual visual inspection stations.',
    problemStatement: 'Human visual inspection fatigue caused inconsistent escape rates (up to 2.8%) on subtle micro-cracks, foreign debris, cold joints, and inverted miniature polarities.',
    methodology: 'Dual-camera 20MP telecentric imaging station running on NVIDIA Jetson Orin AGX edge devices. Multi-spectral lighting (diffuse polarized, coaxial UV, and grazing white) with real-time inference under 120ms per board.',
    toolsUsed: ['PyTorch', 'NVIDIA TensorRT', 'Basler 20MP GigE Cameras', 'Custom Edge AI Rig'],
    ipcStandard: 'IPC-A-610H / IPC-9701',
    targetMetrics: [
      { metric: 'Defect Classification Accuracy', baseline: '91.2%', target: '> 99.0%', achieved: '99.4%' },
      { metric: 'Inspection Cycle Time', baseline: '42 sec/board', target: '< 5 sec/board', achieved: '3.8 sec/board' },
      { metric: 'Escape Rate to Downstream', baseline: '1.8%', target: '< 0.05%', achieved: '0.00% (Zero Escape)' },
    ],
    keyFindings: [
      'Coaxial UV illumination combined with deep feature segmentation detected non-fluorescent solder spatter down to 25 µm.',
      'Transfer learning reduced new PCB model training time from 3 weeks to under 4 hours using synthetic data augmentation.',
      'Operator fatigue-induced inspection variance dropped to zero, enabling 24/7 continuous high-speed inspection throughput.',
    ],
    practicalApplication: 'Piloted on High-Runner Inverter PCB lines at Walton Factory 4; planned expansion to 8 lines by Q4 2026.',
  },
  {
    id: 6,
    title: 'Reliability Assessment of Solder Joints under Thermal Stress',
    category: 'Reliability & Physics',
    status: 'Ongoing Pilot',
    leadAuthor: 'Materials Characterization QM Group',
    department: 'Reliability Physics & Metallurgical Lab',
    timeframe: 'Q3 2025 - Q4 2026',
    featured: true,
    abstract: 'Accelerated thermal cycling (-40°C to +125°C, 30-minute dwells) and cross-sectional SEM/EDX metallurgical evaluations on SAC305 vs Low-Melt Bi-Sn-Ag solder joints to predict 10-year lifespan under extreme operating environments.',
    problemStatement: 'Automotive and outdoor HVAC electronic controller boards experience high mechanical fatigue and intermetallic compound (IMC) growth due to ambient daily thermal cycling.',
    methodology: 'Weibull reliability modeling following JEDEC JESD22-A104E. Resistance daisy-chain continuous in-situ event logging at 1,000, 2,000, and 3,000 cycles combined with cross-sectional ion beam polishing and SEM microscopy.',
    toolsUsed: ['ESPEC Thermal Shock Chamber', 'Zeiss EVO SEM & Oxford EDX', 'Agilent Data Logger', 'Weibull++'],
    ipcStandard: 'IPC-9701A / JEDEC JESD22-A104E',
    targetMetrics: [
      { metric: 'Mean Time to Failure (MTTF)', baseline: '1,450 Cycles', target: '> 2,500 Cycles', achieved: '2,820 Cycles' },
      { metric: 'IMC Thickness Control', baseline: '4.8 µm', target: '< 3.0 µm', achieved: '2.4 µm' },
      { metric: 'Thermal Fatigue Resistance', baseline: '99.1% @ 1k cycles', target: '99.9% @ 2k cycles', achieved: '99.94% @ 2.5k' },
    ],
    keyFindings: [
      'Thinner Cu6Sn5 and Cu3Sn intermetallic layers (<2.5 µm) achieved by micro-alloying with 0.05% Ni drastically suppressed micro-voiding.',
      'Solder joints with conformally coated polyurethane showed 35% higher resistance to shear fatigue during rapid temperature ramp rates.',
      'Validated 10-year field lifespan compliance under harsh tropical climate profiles.',
    ],
    practicalApplication: 'Formulated Walton High-Reliability Soldering Standard (W-HRS-02) for industrial & appliance PCBA divisions.',
  },
  {
    id: 7,
    title: 'Root Cause Analysis of High DPMO Products',
    category: 'Process Optimization',
    status: 'Active Implementation',
    leadAuthor: 'Manufacturing Excellence Team',
    department: 'Quality Engineering & Process Control',
    timeframe: 'Q4 2025 - Q2 2026',
    featured: false,
    abstract: 'Comprehensive 8D problem-solving and Ishikawa root-cause investigation into high DPMO product models, identifying thermal shadowing, inadequate solder volume on ground plane heat sinks, and component lead oxidation.',
    problemStatement: 'Two high-volume consumer appliance PCBA boards consistently exhibited DPMO > 850, causing high rework station bottlenecks and component scrap.',
    methodology: 'Cross-functional 8D methodology, thermal profiling with 12-channel thermocouple logging, XRF plating thickness verification on component reels, and solder mask defined (SMD) vs non-solder mask defined (NSMD) pad redesign.',
    toolsUsed: ['Datapaq Q18 Thermal Tracker', 'X-Ray Inspection (Nordson)', '8D Discipline Tracker', 'MES Analytics'],
    ipcStandard: 'IPC-7095C (BGA) / IPC-A-610',
    targetMetrics: [
      { metric: 'Product A DPMO', baseline: '890 DPMO', target: '< 150 DPMO', achieved: '94 DPMO' },
      { metric: 'Product B DPMO', baseline: '760 DPMO', target: '< 150 DPMO', achieved: '112 DPMO' },
      { metric: 'First-Pass Reflow Yield', baseline: '94.2%', target: '> 98.5%', achieved: '99.1%' },
    ],
    keyFindings: [
      'Heavy copper internal ground planes caused local thermal starvation; resolved by optimizing thermal relief spoke widths from 0.2mm to 0.45mm.',
      'Supplier component lead tinning thickness was inconsistent (some reels < 2 µm); strict inbound XRF inspection enforced.',
      'Adjusted reflow peak soak duration from 60s to 78s, ensuring 100% complete flux activation across heavy electrolytic caps.',
    ],
    practicalApplication: 'Design For Manufacturability (DFM) guidelines updated for all future hardware engineering releases.',
  },
  {
    id: 8,
    title: 'Smart Quality Management System for PCBA Manufacturing',
    category: 'Statistical Quality',
    status: 'Active Implementation',
    leadAuthor: 'Digital Transformation & QM Lead',
    department: 'Smart Factory IT & Quality Architecture',
    timeframe: 'Q1 2025 - Ongoing',
    featured: true,
    abstract: 'Architecting an Industry 4.0 unified Smart Quality Management dashboard aggregating IoT machine telemetry, SPI/AOI defect logs, environmental sensors, and operator work records into a single glass cockpit.',
    problemStatement: 'Disparate databases, manual shift reporting, and delayed defect notifications caused slow containment times and hindered executive quality decision-making.',
    methodology: 'Deployment of MQTT/OPC-UA IoT data brokers connected to SMT machines, environmental humidity sensors, and automated testing rigs. Centralized time-series database with automated real-time KPI streaming and proactive alert push notifications.',
    toolsUsed: ['IoT Gateway OPC-UA', 'PostgreSQL / TimescaleDB', 'React / Tailwind Dashboard', 'FastAPI Microservices'],
    ipcStandard: 'IPC-CFX-2591 / ISO 9001:2015',
    targetMetrics: [
      { metric: 'Defect Notification Latency', baseline: '4.5 hours', target: '< 1 minute', achieved: '12 seconds' },
      { metric: 'Quality Reporting Automation', baseline: '35% digital', target: '100% real-time', achieved: '100% paperless' },
      { metric: 'Line Downtime from Quality Stops', baseline: '26 hrs / mo', target: '< 5 hrs / mo', achieved: '3.8 hrs / mo' },
    ],
    keyFindings: [
      'Real-time line visibility enabled operators to correct stencil alignment drifts before producing defective finished boards.',
      'Eliminated over 12,000 manual paper inspection sheets annually, ensuring 100% data tamper-proof traceability.',
      'Integrated live scrap cost calculations directly linking technical defect counts to financial impact metrics.',
    ],
    practicalApplication: 'The very dashboard currently active in this Walton QM PCBA enterprise software suite.',
  },
  {
    id: 9,
    title: 'IPC Standards Compliance Assessment in PCBA Production',
    category: 'Standards & Governance',
    status: 'Published',
    leadAuthor: 'Certified IPC Master Trainer (MIT)',
    department: 'Quality Compliance & Training Academy',
    timeframe: 'Q2 2025 - Q1 2026',
    featured: false,
    abstract: 'Comprehensive baseline compliance audit of Walton PCBA assembly and soldering operations against IPC-A-610H Class 2 and Class 3 criteria, J-STD-001G requirements, and IPC/WHMA-A-620 cable harness standards.',
    problemStatement: 'Expanding into international Tier-1 export markets demanded strict, verifiable third-party certification of assembly workmanship, solder cleanliness, and ESD protection controls.',
    methodology: 'Full-scope audit across 1,200 criteria encompassing component mounting, through-hole fill, surface cleanliness (ion chromatography testing), solder joint wetting, and operator skill matrix certifications.',
    toolsUsed: ['Dionex Ion Chromatograph', 'IPC-A-610H Standard Guide', 'Calibrated Stereo Microscopes', 'ESD Surface Resistance Meters'],
    ipcStandard: 'IPC-A-610H Class 2 & 3 / J-STD-001G / ANSI/ESD S20.20',
    targetMetrics: [
      { metric: 'Class 3 Audit Conformance Score', baseline: '88.4%', target: '> 98.0%', achieved: '99.2%' },
      { metric: 'Ionic Contamination Level', baseline: '1.24 µg/cm²', target: '< 0.75 µg/cm²', achieved: '0.41 µg/cm²' },
      { metric: 'Certified IPC Specialist (CIS) Staff', baseline: '42 Operators', target: '> 150 Staff', achieved: '184 Certified' },
    ],
    keyFindings: [
      'Automated solvent-free de-ionized water board wash reduced ionic contamination well below military threshold (<0.75 µg NaCl eq./cm²).',
      'Establishing internal IPC Training Academy with hands-on soldering test benches elevated operator retention and defect awareness.',
      'Walton successfully achieved global audit clearance for high-reliability consumer and automotive electronic export contracts.',
    ],
    practicalApplication: 'Established annual recertification cycle and continuous IPC audit scoring protocols across all manufacturing shifts.',
  },
  {
    id: 10,
    title: 'Quality Performance Improvement through Six Sigma DMAIC',
    category: 'Statistical Quality',
    status: 'Active Implementation',
    leadAuthor: 'Master Black Belt (MBB)',
    department: 'Operational Excellence & Lean Six Sigma',
    timeframe: 'Q3 2025 - Q2 2026',
    featured: false,
    abstract: 'Execution of a formal Lean Six Sigma DMAIC (Define, Measure, Analyze, Improve, Control) project targeting wave soldering through-hole solder bridging and blowholes on heavy-copper power supply boards.',
    problemStatement: 'High-density switch-mode power supply (SMPS) PCBA units suffered from an average wave soldering defect rate of 3.4%, causing high touch-up costs and production line congestion.',
    methodology: 'DMAIC roadmap: (D) Project charter and SIPOC map; (M) Gage R&R on solder inspection; (A) Multi-vari chart and regression analysis; (I) Optimization of preheat ramp, solder wave angle (6.5°), and conveyor velocity; (C) Visual management & control plans.',
    toolsUsed: ['Minitab 21', 'Wave Profiler Optimizer', 'Gage R&R Fixtures', 'Standardized Control Plans'],
    ipcStandard: 'Six Sigma DMAIC / IPC-A-610 Section 7',
    targetMetrics: [
      { metric: 'Defect Rate', baseline: '3.42%', target: '< 0.50%', achieved: '0.38%' },
      { metric: 'Process Sigma Level', baseline: '3.32 σ', target: '> 4.50 σ', achieved: '4.68 σ' },
      { metric: 'Annual Scrap & Rework Savings', baseline: '—', target: '$45,000 USD', achieved: '$68,400 USD' },
    ],
    keyFindings: [
      'Gage R&R analysis revealed 28% operator measurement error during manual inspection; resolved by implementing standardized defect boundary visual guides.',
      'Fine-tuning wave solder pot temperature from 250°C to 262°C dramatically improved liquidus fluidity around high thermal mass transformer pins.',
      'Sustained 4.68 Sigma quality performance for over 6 consecutive production months.',
    ],
    practicalApplication: 'Standardized DMAIC methodology now mandated for all quality improvement initiatives exceeding $10,000 baseline scrap.',
  },
];

interface ResearchViewProps {
  onNavigate?: (page: PageId) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  onNavigate = (_page: PageId) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalTopic, setActiveModalTopic] = useState<QMResearchTopic | null>(null);

  const categories = [
    'ALL',
    'Process Optimization',
    'Vision & AI',
    'Reliability & Physics',
    'Statistical Quality',
    'Standards & Governance',
  ];

  const filteredTopics = QM_RESEARCH_TOPICS.filter((topic) => {
    const matchesCategory = selectedCategory === 'ALL' || topic.category === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.toolsUsed.some((tool) => tool.toLowerCase().includes(searchQuery.toLowerCase())) ||
      topic.id.toString() === searchQuery.trim();
    return matchesCategory && matchesSearch;
  });

  const featuredTopics = QM_RESEARCH_TOPICS.filter((t) => t.featured);

  return (
    <div id="page-research-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#cbd5e1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-md border border-[#cbd5e1] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-xs text-[#94a3b8]">/</span>
            <span className="text-xs font-semibold text-[#5b6480]">Quality Management Research</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d1730] tracking-tight flex items-center gap-3">
            <span>Quality Management &amp; PCBA Research Hub</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
              10 Core QM Domains
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Walton Hi-Tech Industries PLC · Applied Quality Engineering, SMT Defect Reduction &amp; Reliability Physics
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('kpi')}
            className="px-4 py-2 bg-white hover:bg-[#f1f5f9] text-[#1c356b] font-bold text-xs rounded-xl border border-[#cbd5e1] shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>KPI Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('pcba-process')}
            className="px-4 py-2 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PCBA Process Flow</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#e0f2fe] text-[#0369a1]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Research Scope</div>
            <div className="text-sm font-bold text-[#0d1730]">10 Core Papers</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#ecfdf5] text-[#059669]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Flagship Projects</div>
            <div className="text-sm font-bold text-[#0d1730]">5 High-Impact AI/QM</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#fef3c7] text-[#b45309]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Standards Grade</div>
            <div className="text-sm font-bold text-[#0d1730]">IPC Class 2 &amp; 3</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f3e8ff] text-[#7e22ce]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Operational Impact</div>
            <div className="text-sm font-bold text-[#0d1730]">&gt; 4.68σ Capability</div>
          </div>
        </div>
      </div>

      {/* Flagship High-Impact Research Initiatives Spotlight (5 user-specified topics) */}
      <div className="bg-gradient-to-r from-[#0d1730] to-[#1c356b] rounded-2xl p-5 sm:p-6 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span>Flagship Strategic Quality Initiatives</span>
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Featured Research Pillars for PCBA Manufacturing
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-medium bg-white/10 px-3 py-1 rounded-full border border-white/15 self-start sm:self-auto">
            Walton QM Laboratory
          </span>
        </div>

        {/* 5 Flagship Pillars Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {featuredTopics.map((feat) => (
            <div
              key={feat.id}
              onClick={() => setActiveModalTopic(feat)}
              className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 font-bold border border-sky-400/30">
                    #{feat.id.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-300 truncate font-medium">
                    {feat.category.split(' ')[0]}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-2 leading-snug">
                  {feat.title}
                </h3>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <span className="text-emerald-400 font-semibold">{feat.status}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1c356b] text-white'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search research topic or tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] placeholder-[#94a3b8] focus:outline-hidden focus:border-[#1c356b]"
          />
        </div>
      </div>

      {/* List of 10 Research Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#0d1730] uppercase tracking-wider">
            Comprehensive QM Research Catalog ({filteredTopics.length} Research Initiatives)
          </h3>
          <span className="text-xs text-[#64748b]">Click any paper for deep-dive experimental metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl border border-[#cbd5e1] p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-lg bg-[#1c356b] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {topic.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                      {topic.category}
                    </span>
                    {topic.featured && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                        FLAGSHIP
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      topic.status === 'Published'
                        ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                        : topic.status === 'Active Implementation'
                        ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                        : 'bg-[#fef9c3] text-[#854d0e] border border-[#fef08a]'
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-[#0d1730] group-hover:text-[#1c356b] transition-colors leading-snug">
                  {topic.title}
                </h4>

                {/* Abstract Preview */}
                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                  {topic.abstract}
                </p>

                {/* Target Metric Mini Highlight */}
                {topic.targetMetrics.length > 0 && (
                  <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-[#64748b]">Primary Metric</div>
                      <div className="font-bold text-[#0d1730] truncate">{topic.targetMetrics[0].metric}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-[#64748b]">Achieved</div>
                      <div className="font-bold text-[#059669]">{topic.targetMetrics[0].achieved}</div>
                    </div>
                  </div>
                )}

                {/* Tools & Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {topic.toolsUsed.slice(0, 3).map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-[#f1f5f9] text-[#334155] px-2 py-0.5 rounded-md border border-[#e2e8f0]"
                    >
                      {tool}
                    </span>
                  ))}
                  {topic.toolsUsed.length > 3 && (
                    <span className="text-[10px] text-[#64748b] font-medium">
                      +{topic.toolsUsed.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="text-[11px] text-[#64748b] font-medium">
                  {topic.ipcStandard.split('/')[0]}
                </span>
                <button
                  onClick={() => setActiveModalTopic(topic)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer"
                >
                  <span>Read Research Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Detailed Viewer for Selected Topic */}
      {activeModalTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#e2e8f0] flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1c356b] text-white flex items-center justify-center shrink-0 font-mono font-bold text-sm">
                  {activeModalTopic.id.toString().padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded-md">
                      {activeModalTopic.category}
                    </span>
                    <span className="text-xs text-[#64748b]">· {activeModalTopic.department}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0d1730] mt-1">
                    {activeModalTopic.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setActiveModalTopic(null)}
                className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0d1730] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
              {/* Executive Abstract */}
              <div className="space-y-1.5 bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c356b] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Executive Abstract</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  {activeModalTopic.abstract}
                </p>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>Industry Problem Statement &amp; Manufacturing Gap</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {activeModalTopic.problemStatement}
                </p>
              </div>

              {/* Research Methodology */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#1c356b]" />
                  <span>Experimental Design &amp; Methodology</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {activeModalTopic.methodology}
                </p>
              </div>

              {/* Target Metrics Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730]">
                  Quantitative Impact &amp; Target Validation
                </h4>
                <div className="border border-[#cbd5e1] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-2.5">Key Performance Indicator</th>
                        <th className="p-2.5">Baseline</th>
                        <th className="p-2.5">Research Target</th>
                        <th className="p-2.5 text-emerald-700">Validated Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] text-[#0d1730]">
                      {activeModalTopic.targetMetrics.map((met, i) => (
                        <tr key={i} className="hover:bg-[#f8fafc]">
                          <td className="p-2.5 font-semibold">{met.metric}</td>
                          <td className="p-2.5 text-[#64748b] font-mono">{met.baseline}</td>
                          <td className="p-2.5 text-[#0369a1] font-mono font-semibold">{met.target}</td>
                          <td className="p-2.5 text-[#059669] font-mono font-bold">{met.achieved}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Findings Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730]">
                  Critical Research Findings &amp; Technical Insights
                </h4>
                <div className="space-y-2">
                  {activeModalTopic.keyFindings.map((finding, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-[#cbd5e1] rounded-xl flex items-start gap-2.5 text-xs text-[#334155]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Production Application & Standard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0]">
                  <div className="text-[11px] font-bold text-[#065f46] uppercase">
                    Walton Production Rollout
                  </div>
                  <div className="text-xs text-[#047857] mt-1 font-medium">
                    {activeModalTopic.practicalApplication}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd]">
                  <div className="text-[11px] font-bold text-[#075985] uppercase">
                    Governing Quality Standards
                  </div>
                  <div className="text-xs text-[#0369a1] font-mono font-bold mt-1">
                    {activeModalTopic.ipcStandard}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-xs text-[#64748b]">
                Authorized by Walton Quality Management &amp; Reliability Division
              </span>
              <button
                onClick={() => setActiveModalTopic(null)}
                className="px-4 py-2 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
