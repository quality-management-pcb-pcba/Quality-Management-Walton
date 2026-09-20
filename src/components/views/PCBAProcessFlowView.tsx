import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowLeft,
  PackageSearch,
  CheckCircle2,
  Droplets,
  Cpu,
  ScanEye,
  Eye,
  Wrench,
  Layers,
  Flame,
  CheckCheck,
  Activity,
  Timer,
  ShieldCheck,
  Package,
  FileCheck2,
  Truck,
  Search,
  ChevronRight,
  Info,
  Layers3,
} from 'lucide-react';

export interface PCBAProcessStep {
  stepNumber: number;
  title: string;
  stageName: string;
  phase:
    | 'Incoming & Material IQC'
    | 'SMT & Post Reflow Inspection'
    | 'THT / MI & Wave Soldering'
    | 'Testing & Environmental Screening'
    | 'Final Inspection & Shipment';
  icon: any;
  shortDesc: string;
  technicalDetails: string;
  keyParameters: { label: string; value: string }[];
  qualityCheckpoint: string;
  ipcStandard: string;
}

export const PCBA_PROCESS_FLOW: PCBAProcessStep[] = [
  {
    stepNumber: 1,
    title: 'Incoming Materials (IQC Inspection)',
    stageName: 'Raw Component & Substrate Verification',
    phase: 'Incoming & Material IQC',
    icon: PackageSearch,
    shortDesc: 'Inspection of active/passive electronic components, raw bare PCBs, connectors, and mechanical hardware against supplier specifications, BOM, and purchase orders.',
    technicalDetails: 'Verification of packaging integrity (tape & reel, tray, tube), MSL (Moisture Sensitivity Level) packaging seals, component markings, lead co-planarity, solderability testing, and counterfeit detection.',
    keyParameters: [
      { label: 'Sampling Standard', value: 'MIL-STD-105E / ANSI ASQ Z1.4' },
      { label: 'AQL Level', value: 'Critical 0, Major 0.4, Minor 1.0' },
      { label: 'MSL Control', value: 'JEDEC J-STD-033 Dry Storage' },
    ],
    qualityCheckpoint: '100% verification of Certificate of Analysis (CoA) and RoHS / REACH compliance compliance.',
    ipcStandard: 'IPC-A-610 / IPC/JEDEC J-STD-020',
  },
  {
    stepNumber: 2,
    title: 'Material Approval',
    stageName: 'ERP / MES Inventory Release & Baking',
    phase: 'Incoming & Material IQC',
    icon: CheckCircle2,
    shortDesc: 'IQC-cleared components are tagged in the ERP/MES system with unique green approval barcodes and transferred into climate-controlled storage or baking ovens.',
    technicalDetails: 'Moisture-sensitive SMD components exposed beyond floor life undergo dehumidifying baking (125°C for 24-48 hrs or 40°C in dry cabinet <5% RH) before SMT feeder kitting to prevent popcorning during reflow.',
    keyParameters: [
      { label: 'Baking Cycle', value: '125°C ± 5°C per J-STD-033' },
      { label: 'Dry Cabinet', value: '≤ 5% RH ambient storage' },
      { label: 'MES Traceability', value: 'Unique Lot UID Barcode' },
    ],
    qualityCheckpoint: 'Floor life countdown timer initialized in MES upon opening vacuum moisture barrier bags.',
    ipcStandard: 'JEDEC J-STD-033D',
  },
  {
    stepNumber: 3,
    title: 'Solder Paste IQC',
    stageName: 'Cold Chain Management & Viscosity Audit',
    phase: 'Incoming & Material IQC',
    icon: Droplets,
    shortDesc: 'Inspection, cold storage temperature monitoring (2°C–10°C), scheduled thawing, planetary mixing, and viscosity testing of lead-free SAC305 solder paste.',
    technicalDetails: 'Paste jars must thaw unopened at ambient room temp (22°C–25°C) for at least 4 hours before use. Centrifugal mixing ensures uniform flux-alloy dispersion. Spiral viscotester verifies shear thinning behavior.',
    keyParameters: [
      { label: 'Alloy Type', value: 'SAC305 (Sn96.5 Ag3.0 Cu0.5)' },
      { label: 'Storage Temp', value: '2°C – 10°C Refrigerated' },
      { label: 'Thaw Duration', value: '≥ 4 Hours before jar opening' },
    ],
    qualityCheckpoint: 'Viscosity, metal percentage (88.5%–89.5%), and pot life timer stamp logged prior to line release.',
    ipcStandard: 'IPC J-STD-004B / IPC J-STD-005A',
  },
  {
    stepNumber: 4,
    title: 'SMT Process',
    stageName: 'Stencil Printing, High-Speed Pick & Place, Reflow',
    phase: 'SMT & Post Reflow Inspection',
    icon: Cpu,
    shortDesc: 'Automated surface mount assembly line: automated stencil printing with squeegees, high-speed chip shooters and modular placers, followed by multi-zone nitrogen reflow soldering.',
    technicalDetails: 'Laser-cut electro-polished stencils with nano-coating deposit solder paste onto PCB pads. Pick-and-place placement heads mount components down to 01005 chips and fine-pitch 0.3mm BGAs with optical vision alignment. 10-zone reflow oven executes precise thermal profiling (preheat, soak, reflow peak 240°C–245°C, controlled liquidus cooling).',
    keyParameters: [
      { label: 'Placement Accuracy', value: '± 25 µm @ 3-Sigma' },
      { label: 'Reflow Atmosphere', value: 'N2 Inert Gas (O2 < 500 ppm)' },
      { label: 'Peak Temperature', value: '240°C – 248°C (Time Above Liquidus 45–60s)' },
    ],
    qualityCheckpoint: 'Real-time Datapaq thermocouple profiling and feeder pick-rate monitoring (>99.98%).',
    ipcStandard: 'IPC-7530A / IPC-9850',
  },
  {
    stepNumber: 5,
    title: 'SPI Inspection',
    stageName: '3D Solder Paste Inspection',
    phase: 'SMT & Post Reflow Inspection',
    icon: ScanEye,
    shortDesc: 'In-line 3D SPI measures 100% of deposited solder paste bricks immediately after stencil printing to catch volume, height, area, and offset deviations before placement.',
    technicalDetails: 'Phase-shift moiré fringe optical scanning calculates exact solder paste deposit volume, height (100–150 µm), area coverage, bridge formation, and registration offset. Automatically alerts stencil printer to trigger under-stencil solvent wiper cycle.',
    keyParameters: [
      { label: 'Target Height', value: '120 µm ± 20 µm' },
      { label: 'Volume Range', value: '80% – 130% nominal' },
      { label: 'Inspection Rate', value: '100% of apertures scanned' },
    ],
    qualityCheckpoint: 'Closed-loop feedback to stencil printer for automatic XY offset and cleaning correction.',
    ipcStandard: 'IPC-7527 / IPC-A-610',
  },
  {
    stepNumber: 6,
    title: 'AOI Inspection-1 (Post Reflow)',
    stageName: 'Automated Optical Inspection After Reflow',
    phase: 'SMT & Post Reflow Inspection',
    icon: Eye,
    shortDesc: 'Multi-directional high-resolution 3D AOI scans assemblies exiting the reflow oven to detect soldering and placement defects across all SMT components.',
    technicalDetails: 'Combines multi-angle RGB LED ring illumination and structured telecentric 3D cameras. Accurately flags missing components, misalignment, tombstoning, billboarding, polarity inversion, solder bridging, insufficient solder, and solder balls.',
    keyParameters: [
      { label: 'Detection Resolution', value: '10 µm optical / 1 µm height' },
      { label: 'Cycle Time', value: '< 25s per board panel' },
      { label: 'False Call Rate', value: '< 50 PPM target' },
    ],
    qualityCheckpoint: '100% post-reflow inspection gate; failing boards auto-routed to defect verification station.',
    ipcStandard: 'IPC-A-610H Class 2 & 3',
  },
  {
    stepNumber: 7,
    title: 'Defect Analysis & Repair',
    stageName: 'Rework Station & Root Cause Feedback',
    phase: 'SMT & Post Reflow Inspection',
    icon: Wrench,
    shortDesc: 'IPC-7711/7721 certified technicians verify defects flagged by post-reflow AOI, perform precision micro-rework, and log fault categories for continuous line improvement.',
    technicalDetails: 'Using specialized infrared BGA rework stations, micro-soldering irons with nitrogen purge, and stereomicroscopes. Reworked joints undergo immediate secondary optical inspection and barcode logging to identify trending feeder or nozzle issues.',
    keyParameters: [
      { label: 'Rework Tooling', value: 'Hot air / IR split-vision BGA station' },
      { label: 'Operator Standard', value: 'IPC-7711 / 7721 Certified Reworker' },
      { label: 'Traceability', value: 'Defect code logged in MES portal' },
    ],
    qualityCheckpoint: 'Thermal profile validation for BGA/QFN rework to prevent adjacent component reflow.',
    ipcStandard: 'IPC-7711 / IPC-7721 Rework & Repair',
  },
  {
    stepNumber: 8,
    title: 'Visual Inspection',
    stageName: 'SMT Secondary QC Audit',
    phase: 'SMT & Post Reflow Inspection',
    icon: Eye,
    shortDesc: 'Certified quality control inspectors conduct manual microscopic sampling audits (10X–20X) to verify solder joint wetting, solder fillet heights, and board surface cleanliness.',
    technicalDetails: 'Focuses on non-AOI covered criteria such as solder spatter, flux residue, PCB edge chipping, conformal coating readiness, and mechanical component seating flatness.',
    keyParameters: [
      { label: 'Optical Aid', value: '10X – 20X Binocular Microscope' },
      { label: 'Inspection Light', value: 'Shadowless 1000 Lux White LED' },
      { label: 'Audit Sampling', value: 'AQL 0.4 Level II Tightened' },
    ],
    qualityCheckpoint: 'Solder fillet wetting angle < 90° compliant with IPC Class 2/3 criteria.',
    ipcStandard: 'IPC-A-610H Chapter 8 (SMT)',
  },
  {
    stepNumber: 9,
    title: 'MI / THT Assembly',
    stageName: 'Manual Insertion & Through-Hole Mounting',
    phase: 'THT / MI & Wave Soldering',
    icon: Layers,
    shortDesc: 'Through-hole technology (THT) components—electrolytic capacitors, power inductors, relays, terminal blocks, and transformers—are inserted into plated through-holes.',
    technicalDetails: 'Conveyorized assembly line with anti-ESD wrist straps, component lead pre-forming machines (lead pitch bending and standoff formation), and titanium pallet carriers holding boards securely.',
    keyParameters: [
      { label: 'Lead Forming', value: 'Automated cut & clinch lead tooling' },
      { label: 'Lead Protrusion', value: '1.0 mm to 2.5 mm per IPC spec' },
      { label: 'Carrier Pallet', value: 'Durostone synthetic wave pallet' },
    ],
    qualityCheckpoint: 'Verification of component orientation, polarity notch matching, and lead protrusion depth.',
    ipcStandard: 'IPC-A-610H Chapter 7 (Through-Hole)',
  },
  {
    stepNumber: 10,
    title: 'Wave Soldering',
    stageName: 'Flux Spray, Preheat & Dual Wave Soldering',
    phase: 'THT / MI & Wave Soldering',
    icon: Flame,
    shortDesc: 'Palletized boards pass over ultrasonic spray fluxer, convection preheating zones, and molten lead-free solder waves (chip wave and laminar wave) to solder all through-hole leads.',
    technicalDetails: 'No-clean spray flux coats component leads uniformly. Infrared preheaters activate flux and elevate board temp to 105°C–120°C. Primary turbulent chip wave penetrates tight gaps; secondary laminar smooth wave strips solder bridges. Pot temperature maintained at 255°C–265°C.',
    keyParameters: [
      { label: 'Solder Pot Temp', value: '255°C – 265°C (Lead-Free Sn-Ag-Cu / Sn-Cu)' },
      { label: 'Preheat Board Temp', value: '105°C – 120°C Top-side' },
      { label: 'Conveyor Speed & Angle', value: '1.0 – 1.3 m/min @ 6° – 7° Incline' },
    ],
    qualityCheckpoint: 'Barrel fill through-hole solder climb rate > 75% for Class 2, > 100% for Class 3.',
    ipcStandard: 'IPC-A-610H Section 7.3.5',
  },
  {
    stepNumber: 11,
    title: 'AOI Inspection-2 (If Available)',
    stageName: 'Post-Wave / Bottom-Side Automated Optical Check',
    phase: 'THT / MI & Wave Soldering',
    icon: ScanEye,
    shortDesc: 'Bottom-side specialized AOI inspects wave-soldered through-hole joints for solder shorts, blowholes, solder bridges, missing pins, and insufficient hole fill.',
    technicalDetails: 'Uses high-angle color projection to analyze the meniscus shape and height of solder fillets on through-hole pins, rapidly distinguishing between acceptable concave fillets and excessive solder flags.',
    keyParameters: [
      { label: 'Detection Scope', value: 'Through-hole leads, bridges, cold solder' },
      { label: 'Lighting System', value: 'Color highlights multi-tiered LED array' },
      { label: 'Throughput', value: 'Inline matched to wave conveyor rate' },
    ],
    qualityCheckpoint: 'Automated detection of pin-to-pin solder shorts and unclipped lead protrusions.',
    ipcStandard: 'IPC-A-610H Section 7.3',
  },
  {
    stepNumber: 12,
    title: 'Visual Inspection',
    stageName: 'Post-Wave Touch-up & Mechanical QC',
    phase: 'THT / MI & Wave Soldering',
    icon: Eye,
    shortDesc: 'Final post-wave manual inspection: verification of through-hole top-side solder climb, removal of any residual solder flags, cleaning of solder balls, and connector integrity inspection.',
    technicalDetails: 'Manual soldering irons calibrated with K-type thermocouples are used for any minor touch-up using approved flux-cored wire matching alloy chemistry.',
    keyParameters: [
      { label: 'Soldering Temp', value: '350°C ± 10°C touch-up iron tip' },
      { label: 'Contact Time', value: '2 – 3 seconds max per joint' },
      { label: 'Cleanliness Check', value: 'Zero solder balls or loose copper wire strands' },
    ],
    qualityCheckpoint: '100% inspection of critical high-voltage clearance gaps and connector pins.',
    ipcStandard: 'IPC-A-610H / J-STD-001G',
  },
  {
    stepNumber: 13,
    title: 'Functional Test',
    stageName: 'FCT & In-Circuit Power-Up Emulation',
    phase: 'Testing & Environmental Screening',
    icon: CheckCheck,
    shortDesc: 'Automated test fixtures (FCT / ICT) apply operating DC/AC voltages, stimulate inputs, program microcontrollers, and measure analog/digital operational signals against target specifications.',
    technicalDetails: 'Custom bed-of-nails test fixtures with pneumatic clamps connect to test pads. Automated software runs firmware flashing, bus communication checks (I2C, SPI, UART, CAN), voltage rail calibration, and load response validation under realistic operating conditions.',
    keyParameters: [
      { label: 'Test System', value: 'Automated FCT Fixture with MCU Flasher' },
      { label: 'Signal Measurements', value: 'Voltage, Current, Frequency, Ripple' },
      { label: 'Cycle Time', value: '25s – 60s per board test' },
    ],
    qualityCheckpoint: '100% functional pass required; automated serialization and test report uploaded to MES.',
    ipcStandard: 'IPC-9252 / IEEE 1149.1 Boundary Scan',
  },
  {
    stepNumber: 14,
    title: 'Burn-in / Aging Test (If Required)',
    stageName: 'Thermal & Electrical Stress Screening',
    phase: 'Testing & Environmental Screening',
    icon: Timer,
    shortDesc: 'Assembled boards run continuously under full electrical power loads inside thermal aging chambers (45°C–65°C for 2–24 hours) to screen out early infant mortality failures.',
    technicalDetails: 'Applied to mission-critical, automotive, or industrial inverter boards. Monitored burn-in racks measure active power consumption, detecting thermal drift, cold solder intermittent opens, or component silicon defects before product dispatch.',
    keyParameters: [
      { label: 'Chamber Temp', value: '45°C – 65°C Controlled' },
      { label: 'Test Duration', value: '2 Hours to 24 Hours continuous' },
      { label: 'Electrical Load', value: '80% – 100% rated operational current' },
    ],
    qualityCheckpoint: 'Continuous parameter telemetry logging; zero fault drops during thermal cycle.',
    ipcStandard: 'MIL-STD-810 / IPC-9701 Reliability Spec',
  },
  {
    stepNumber: 15,
    title: 'Final Quality Inspection (FQC)',
    stageName: 'Finished Goods Quality Audit',
    phase: 'Final Inspection & Shipment',
    icon: ShieldCheck,
    shortDesc: 'Comprehensive final quality audit reviewing workmanship, aesthetic cleanliness, mechanical mounting tolerances, label barcodes, and conformance to customer engineering requirements.',
    technicalDetails: 'FQC inspectors verify full traceability history in MES (IQC records, SMT SPI/AOI logs, FCT test logs). Physical checks include screw torque validation, heatsink paste application, and enclosure fitment.',
    keyParameters: [
      { label: 'Audit Sampling', value: '100% critical check / AQL 0.25 audit' },
      { label: 'Inspection Guide', value: 'IPC-A-610 Class 2 & 3 Workmanship' },
      { label: 'Torque Audit', value: 'Calibrated digital torque driver check' },
    ],
    qualityCheckpoint: 'Official FQC Stamp placed on PCBA barcode label and MES release flag enabled.',
    ipcStandard: 'IPC-A-610H / ISO 9001:2015',
  },
  {
    stepNumber: 16,
    title: 'Packing Inspection',
    stageName: 'ESD Protection & Carton Packaging Verification',
    phase: 'Final Inspection & Shipment',
    icon: Package,
    shortDesc: 'Audit of anti-static shielding bags, desiccants, humidity indicator cards (HIC), partition dividers, protective bubble cushioning, and carton carton drop-strength.',
    technicalDetails: 'Finished PCBAs are placed inside anti-static dissipative shielding bags (surface resistivity 10^4 to 10^11 Ω/sq). Proper ESD label seals applied. Outer cartons packed with custom EPE foam inserts to withstand transit vibration.',
    keyParameters: [
      { label: 'Bag Spec', value: 'ESD Static Shielding Bag ANSI/ESD S20.20' },
      { label: 'Surface Resistivity', value: '10^4 – 10^11 Ohms/sq' },
      { label: 'Carton Test', value: 'ISTA 1A Drop & Vibration Certified' },
    ],
    qualityCheckpoint: 'Verification of ESD symbol, moisture indicator card, and barcode legibility.',
    ipcStandard: 'ANSI/ESD S20.20 / IPC-1601',
  },
  {
    stepNumber: 17,
    title: 'OQC Approval',
    stageName: 'Outgoing Quality Control & Conformance Clearance',
    phase: 'Final Inspection & Shipment',
    icon: FileCheck2,
    shortDesc: 'Senior Outgoing Quality Control (OQC) engineers perform final random sampling inspections on palletized cartons and issue the Walton Certificate of Conformance (CoC).',
    technicalDetails: 'Audits packing slip accuracy, customer model numbers, quantity counts, serial number range integrity, and international regulatory markings (CE, RoHS, UL, FCC). Issues formal shipment clearance in ERP.',
    keyParameters: [
      { label: 'Sampling Standard', value: 'AQL 0.25 Outgoing Sampling' },
      { label: 'Dossier Validation', value: 'CoC, RoHS declaration, FCT data summary' },
      { label: 'Approval Sign-off', value: 'OQC Department Head Signature' },
    ],
    qualityCheckpoint: 'Full documentation match with zero non-conformances prior to pallet shrink-wrapping.',
    ipcStandard: 'ISO 9001:2015 / Walton Corporate Quality Manual',
  },
  {
    stepNumber: 18,
    title: 'Shipment',
    stageName: 'Finished Goods Logistics & Dispatch',
    phase: 'Final Inspection & Shipment',
    icon: Truck,
    shortDesc: 'Palletized finished goods are loaded into climate-controlled logistics trucks or shipping containers for delivery to customer warehouses or Walton finished product assembly divisions.',
    technicalDetails: 'Pallets are wrapped with UV-resistant stretch film with corner edge protectors and moisture-proof plastic top covers. GPS temperature and humidity logging sensors are deployed inside export container shipments.',
    keyParameters: [
      { label: 'Palletizing', value: 'Standard Euro / Industrial wood pallet heat treated ISPM 15' },
      { label: 'Container Seal', value: 'High-security numbered bolt seal' },
      { label: 'Logistics Tracking', value: 'Real-time ERP dispatch notification' },
    ],
    qualityCheckpoint: 'Final bill of lading, export customs manifest, and logistics inspection sign-off.',
    ipcStandard: 'ASTM D4169 / ISTA 3A Distribution Guidelines',
  },
];

interface PCBAProcessFlowViewProps {
  onNavigate?: (page: PageId) => void;
}

export const PCBAProcessFlowView: React.FC<PCBAProcessFlowViewProps> = ({
  onNavigate = (_page: PageId) => {},
}) => {
  const [selectedStep, setSelectedStep] = useState<PCBAProcessStep>(PCBA_PROCESS_FLOW[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');

  const phases = [
    'ALL',
    'Incoming & Material IQC',
    'SMT & Post Reflow Inspection',
    'THT / MI & Wave Soldering',
    'Testing & Environmental Screening',
    'Final Inspection & Shipment',
  ];

  const filteredSteps = PCBA_PROCESS_FLOW.filter((s) => {
    const matchesPhase = phaseFilter === 'ALL' || s.phase === phaseFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stepNumber.toString() === searchQuery.trim();
    return matchesPhase && matchesSearch;
  });

  return (
    <div id="page-pcba-process-flow" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
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
            <button
              onClick={() => onNavigate('pcba')}
              className="text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer"
            >
              PCBA Quality
            </button>
            <span className="text-xs text-[#94a3b8]">/</span>
            <span className="text-xs font-semibold text-[#5b6480]">Manufacturing Process Flow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d1730] tracking-tight flex items-center gap-3">
            <span>PCBA Manufacturing Process Flow</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
              18 Step Sequence
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Walton Hi-Tech Industries PLC · Surface Mount (SMT) &amp; Through-Hole (THT) Assembly Pipeline
          </p>
        </div>

        {/* Quick Navigation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('pcba')}
            className="px-4 py-2 bg-white hover:bg-[#f1f5f9] text-[#1c356b] font-bold text-xs rounded-xl border border-[#cbd5e1] shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PCBA Quality Metrics</span>
          </button>
          <button
            onClick={() => onNavigate('pcb-process')}
            className="px-4 py-2 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PCB Process Flow</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#e0f2fe] text-[#0369a1]">
            <PackageSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Inbound Control</div>
            <div className="text-sm font-bold text-[#0d1730]">IQC Material Gate</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#fef3c7] text-[#b45309]">
            <ScanEye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Automated Vision</div>
            <div className="text-sm font-bold text-[#0d1730]">3D SPI &amp; Dual AOI</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#ecfdf5] text-[#059669]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Testing Coverage</div>
            <div className="text-sm font-bold text-[#0d1730]">100% FCT &amp; Aging</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f1f5f9] text-[#475569]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Quality Release</div>
            <div className="text-sm font-bold text-[#0d1730]">FQC &amp; OQC Clearance</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Phase Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          {phases.map((ph) => (
            <button
              key={ph}
              onClick={() => setPhaseFilter(ph)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                phaseFilter === ph
                  ? 'bg-[#1c356b] text-white'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              {ph}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PCBA process step..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs text-[#0d1730] placeholder-[#94a3b8] focus:outline-hidden focus:border-[#1c356b]"
          />
        </div>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): The Complete Sequential Flow Chart */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-base font-bold text-[#0d1730] flex items-center gap-2">
                  <span>Assembly Flow Pipeline</span>
                  <span className="text-xs font-mono font-normal text-[#64748b]">
                    ({filteredSteps.length} of 18 steps)
                  </span>
                </h3>
                <p className="text-[11px] text-[#64748b]">Click any step to inspect technical details</p>
              </div>
            </div>

            {/* Vertical Flowchart Steps */}
            <div className="relative pl-4 sm:pl-6 space-y-2 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#cbd5e1]">
              {filteredSteps.map((step, idx) => {
                const isSelected = selectedStep.stepNumber === step.stepNumber;

                return (
                  <div key={step.stepNumber} className="relative">
                    {/* Step Card Item */}
                    <div
                      onClick={() => setSelectedStep(step)}
                      className={`relative z-10 p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#f0fdf4] border-[#16a34a] shadow-sm ring-1 ring-[#16a34a]'
                          : 'bg-white hover:bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    >
                      {/* Step Number Badge */}
                      <div
                        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono font-extrabold text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#16a34a] text-white shadow-xs'
                            : 'bg-[#f1f5f9] text-[#1c356b] border border-[#cbd5e1]'
                        }`}
                      >
                        {step.stepNumber.toString().padStart(2, '0')}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isSelected ? 'text-[#15803d]' : 'text-[#0d1730]'
                            }`}
                          >
                            {step.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#94a3b8] shrink-0">
                            {step.ipcStandard.split('/')[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] truncate mt-0.5">{step.stageName}</p>
                      </div>

                      {/* Right Chevron */}
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[#16a34a] translate-x-0.5' : 'text-[#cbd5e1]'
                        }`}
                      />
                    </div>

                    {/* Flow arrow connecting next step (except last) */}
                    {idx < filteredSteps.length - 1 && (
                      <div className="flex items-center justify-center py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] -ml-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Deep-Dive Step Description Card */}
        <div className="lg:col-span-7 space-y-4 sticky top-4">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-5 sm:p-6 shadow-sm space-y-5">
            {/* Header of selected step */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#1c356b] text-white flex items-center justify-center shrink-0 shadow-xs">
                  {React.createElement(selectedStep.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold bg-[#ecfdf5] text-[#15803d]">
                      STEP {selectedStep.stepNumber.toString().padStart(2, '0')} OF 18
                    </span>
                    <span className="text-xs text-[#64748b] font-medium">· {selectedStep.phase}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0d1730] mt-1">
                    {selectedStep.title}
                  </h2>
                  <p className="text-xs text-[#64748b] font-medium">{selectedStep.stageName}</p>
                </div>
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  disabled={selectedStep.stepNumber === 1}
                  onClick={() => {
                    const prev = PCBA_PROCESS_FLOW.find((s) => s.stepNumber === selectedStep.stepNumber - 1);
                    if (prev) setSelectedStep(prev);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[#1c356b] cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={selectedStep.stepNumber === 18}
                  onClick={() => {
                    const next = PCBA_PROCESS_FLOW.find((s) => s.stepNumber === selectedStep.stepNumber + 1);
                    if (next) setSelectedStep(next);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[#1c356b] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5 bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1c356b] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Process Short Description</span>
              </div>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {selectedStep.shortDesc}
              </p>
            </div>

            {/* In-Depth Technical Engineering Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730]">
                Technical Manufacturing &amp; Assembly Mechanics
              </h4>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {selectedStep.technicalDetails}
              </p>
            </div>

            {/* Key Parameters Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730]">
                Critical Quality &amp; Engineering Parameters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedStep.keyParameters.map((param, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-[#cbd5e1] rounded-xl shadow-2xs space-y-1"
                  >
                    <div className="text-[10px] uppercase font-bold text-[#64748b]">{param.label}</div>
                    <div className="text-xs font-bold font-mono text-[#0d1730]">{param.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Checkpoint & Standards Footer Box */}
            <div className="pt-3 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#065f46]">Quality Inspection Checkpoint</div>
                  <div className="text-[11px] text-[#047857] mt-0.5">
                    {selectedStep.qualityCheckpoint}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#075985]">Applicable IPC Standard</div>
                  <div className="text-[11px] font-mono text-[#0369a1] mt-0.5 font-bold">
                    {selectedStep.ipcStandard}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Flow Schematic Banner */}
          <div className="bg-[#0f172a] rounded-2xl p-4 sm:p-5 text-white border border-[#334155] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#4ade80] flex items-center gap-1.5">
                <Layers3 className="w-4 h-4" />
                <span>End-to-End PCBA Quality Pipeline</span>
              </span>
              <span className="text-[10px] text-[#94a3b8] font-mono">Walton SMT Manufacturing Complex</span>
            </div>
            <div className="text-[11px] text-[#94a3b8] leading-relaxed">
              Every PCBA lot executes through all 18 quality checkpoints under IPC-A-610 Class 2 &amp; 3 standards, supported by 100% automated 3D SPI, dual AOI inspection, and full-power functional in-circuit testing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
