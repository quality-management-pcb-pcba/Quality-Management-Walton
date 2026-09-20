import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  ArrowLeft,
  FileCode2,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  Layers3,
  Flame,
  CircleDot,
  Brush,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  Search,
  ChevronRight,
  ExternalLink,
  Info,
  Check,
  Zap,
} from 'lucide-react';

interface PCBProcessStep {
  stepNumber: number;
  title: string;
  stageName: string;
  phase: 'Pre-Production & CAM' | 'Inner Layer Fabrication' | 'Lamination & Drilling' | 'Plating & Outer Layer' | 'Solder Mask & Finish' | 'Testing & Quality Inspection';
  icon: any;
  shortDesc: string;
  technicalDetails: string;
  keyParameters: { label: string; value: string }[];
  qualityCheckpoint: string;
  ipcStandard: string;
}

export const PCB_PROCESS_FLOW: PCBProcessStep[] = [
  {
    stepNumber: 1,
    title: 'Customer Gerber File',
    stageName: 'Customer Data Intake',
    phase: 'Pre-Production & CAM',
    icon: FileCode2,
    shortDesc: 'Customer design files (Gerber RS-274X, ODB++, NC Drill, BOM, fabrication drawings) are received and cataloged into Walton PLM system.',
    technicalDetails: 'Verification of file integrity, layer assignments, copper thickness specifications, dielectric stackup, minimum trace/space clearances, and hole size definitions.',
    keyParameters: [
      { label: 'File Formats', value: 'RS-274X, ODB++, IPC-2581' },
      { label: 'Input Verification', value: 'Checksum & Layer Mapping' },
      { label: 'Stackup Schema', value: 'Single / Multi-Layer Spec' },
    ],
    qualityCheckpoint: 'Inbound file completeness audit against customer engineering release notes.',
    ipcStandard: 'IPC-2581 / IPC-D-356',
  },
  {
    stepNumber: 2,
    title: 'Engineering Review (CAM)',
    stageName: 'Design For Manufacturability (DFM)',
    phase: 'Pre-Production & CAM',
    icon: Cpu,
    shortDesc: 'CAM engineers perform thorough DFM/DFA checks, etch compensation calculations, panelization design, and generate phototool/drill CNC programs.',
    technicalDetails: 'Automated DFM analysis checks for acid traps, starvation pads, acute angle copper, annular ring constraints, thermal reliefs, and impedance coupon placement.',
    keyParameters: [
      { label: 'CAM Tooling', value: 'Genesis / InCAM Pro' },
      { label: 'Etch Compensation', value: '+1.5 mil to +2.5 mil' },
      { label: 'Production Panel', value: 'Working Panel Layout with Coupons' },
    ],
    qualityCheckpoint: 'Engineering Query (EQ) resolution and pre-production tooling sign-off.',
    ipcStandard: 'IPC-7351 / IPC-2221B',
  },
  {
    stepNumber: 3,
    title: 'Material Preparation',
    stageName: 'Copper Clad Laminate (CCL) Pre-Cut & Bake',
    phase: 'Inner Layer Fabrication',
    icon: Layers,
    shortDesc: 'Premium copper clad laminate (FR-4 / High TG / Halogen-Free) is precision cut to working panel dimensions and baked in ovens to relieve internal stresses.',
    technicalDetails: 'Thermal conditioning prevents warpage, shrinkage, and delamination during subsequent hot lamination press cycles. Surface is micro-etched for photoresist bonding.',
    keyParameters: [
      { label: 'Base Laminate', value: 'FR-4 High TG 150°C - 170°C' },
      { label: 'Copper Weight', value: '0.5 oz, 1.0 oz, 2.0 oz (18µm - 70µm)' },
      { label: 'De-Stressing Bake', value: '150°C for 3.5 Hours' },
    ],
    qualityCheckpoint: 'Laminate thickness micrometer check, copper foil peeling strength test.',
    ipcStandard: 'IPC-4101E Spec Sheets',
  },
  {
    stepNumber: 4,
    title: 'Inner Layer Imaging',
    stageName: 'Dry Film Photoresist Application & LDI',
    phase: 'Inner Layer Fabrication',
    icon: Sparkles,
    shortDesc: 'Photosensitive dry film resist is laminated onto copper surfaces under cleanroom Class 10,000 conditions, followed by Laser Direct Imaging (LDI) UV exposure.',
    technicalDetails: 'High-precision laser directs CAD pattern directly onto resist without photomasks, achieving ultra-fine pitch trace resolution down to 3 mil (75 µm).',
    keyParameters: [
      { label: 'Resist Type', value: 'Negative Aqueous Dry Film' },
      { label: 'Exposure Tech', value: 'Laser Direct Imaging (LDI 405nm)' },
      { label: 'Cleanroom Class', value: 'Class 10,000 / Yellow Room' },
    ],
    qualityCheckpoint: 'Optical step-tablet exposure level test and resist adhesion verification.',
    ipcStandard: 'IPC-6012E Class 3',
  },
  {
    stepNumber: 5,
    title: 'Inner Layer Etching',
    stageName: 'DES Line (Develop - Etch - Strip)',
    phase: 'Inner Layer Fabrication',
    icon: Flame,
    shortDesc: 'Unexposed resist is developed, unprotected copper is chemically etched away using alkaline or cupric chloride, and the remaining dry film resist is stripped.',
    technicalDetails: 'Conveyorized spray etching dissolves exposed copper, leaving pristine inner copper traces and ground planes. Strip bath strips resist cleanly without residue.',
    keyParameters: [
      { label: 'Etchant Chem', value: 'Acid Cupric Chloride (CuCl2)' },
      { label: 'Etch Speed', value: 'Auto-regulated via ORP / SG sensors' },
      { label: 'Stripper Chem', value: 'Dilute NaOH / KOH at 50°C' },
    ],
    qualityCheckpoint: 'Trace width, trace spacing, and copper thickness cross-section audit.',
    ipcStandard: 'IPC-A-600K Class 3',
  },
  {
    stepNumber: 6,
    title: 'AOI Inspection',
    stageName: 'Automated Optical Inspection (Inner Layers)',
    phase: 'Inner Layer Fabrication',
    icon: Eye,
    shortDesc: 'High-speed automated cameras scan 100% of inner layer surfaces, cross-referencing digitized copper conductors against master CAD CAM vector data.',
    technicalDetails: 'Instantly identifies opens, shorts, mouse bites, pinholes, residual copper, and neckdown defects before layers are permanently laminated together.',
    keyParameters: [
      { label: 'Inspection Res', value: '0.35 mil (8.8 µm) pixel optical' },
      { label: 'Defect Types', value: 'Opens, Shorts, Pits, Inclusions' },
      { label: 'Defect Review', value: 'Dedicated VRS Verification Station' },
    ],
    qualityCheckpoint: '100% zero-escape inner layer gate; defect panels repaired or scrapped immediately.',
    ipcStandard: 'IPC-6012 Class 3 / IPC-A-600',
  },
  {
    stepNumber: 7,
    title: 'Layer Alignment & Lay-up',
    stageName: 'Oxide Treatment & Prepreg Pinning',
    phase: 'Lamination & Drilling',
    icon: Layers3,
    shortDesc: 'Inner copper layers receive brown/black oxide micro-roughening treatment, then stacked precisely with fiberglass prepreg epoxy sheets using optic pin registration.',
    technicalDetails: 'Prepreg sheets act as dielectric adhesive insulator. Multi-layer panels are pinned with precision hardened tooling pins to ensure layer-to-layer registration within ±1.5 mil.',
    keyParameters: [
      { label: 'Bond Treatment', value: 'Brown Oxide Silane Micro-etch' },
      { label: 'Dielectric Material', value: 'Prepreg (1080, 2116, 7628 resin glass)' },
      { label: 'Pin Registration', value: 'CCD Vision Optic Pin Punching' },
    ],
    qualityCheckpoint: 'X-Ray target verification and panel bookbook stackup sequence review.',
    ipcStandard: 'IPC-4101 / IPC-TM-650',
  },
  {
    stepNumber: 8,
    title: 'Lamination Press',
    stageName: 'Vacuum Hot Lamination & Cooling',
    phase: 'Lamination & Drilling',
    icon: Flame,
    shortDesc: 'Layer stackup is compressed inside a heavy vacuum hydraulic lamination press under controlled high heat (185°C - 200°C) and pressure (350 PSI).',
    technicalDetails: 'Vacuum removes all trapped air bubbles while heat liquefies the epoxy prepreg resin, fusing all copper inner layers and outer copper foils into a solid, monolithic panel.',
    keyParameters: [
      { label: 'Peak Temp', value: '185°C – 195°C' },
      { label: 'Hydraulic Pressure', value: '300 – 350 PSI' },
      { label: 'Cycle Duration', value: '120 min Cure + 60 min Controlled Cool' },
    ],
    qualityCheckpoint: 'Tg (Glass Transition Temperature) DSC test & micro-section resin cure check.',
    ipcStandard: 'IPC-TM-650 2.4.24',
  },
  {
    stepNumber: 9,
    title: 'Drilling',
    stageName: 'CNC Mechanical & Laser Micro-Vias',
    phase: 'Lamination & Drilling',
    icon: CircleDot,
    shortDesc: 'High-speed CNC spindle drills (up to 200,000 RPM) drill through-holes and component vias through the laminated multi-layer panel with entry/backup aluminum sheets.',
    technicalDetails: 'Solid carbide micro-drills cut through glass fibers and copper cleanly. Laser drilling is employed for blind and buried micro-vias down to 0.1mm (100 µm).',
    keyParameters: [
      { label: 'Spindle Speed', value: '160,000 – 200,000 RPM' },
      { label: 'Min Drill Size', value: '0.15 mm (Mechanical) / 0.075 mm (Laser)' },
      { label: 'Drill Lifetime', value: 'Auto Tool Changer @ 1,500 Hits Limit' },
    ],
    qualityCheckpoint: 'X-ray coordinate verification for drill-to-inner-copper hole centering.',
    ipcStandard: 'IPC-6012E Section 3.4',
  },
  {
    stepNumber: 10,
    title: 'Hole Cleaning (Desmear)',
    stageName: 'Plasma & Permanganate Etchback',
    phase: 'Plating & Outer Layer',
    icon: Brush,
    shortDesc: 'Chemical permanganate or plasma treatment removes melted resin smear caused by drill heat and etches back dielectric walls inside through-holes.',
    technicalDetails: 'Ensures inner layer copper pad rings are completely exposed on hole wall barrels, establishing direct molecular-level contact for subsequent copper plating.',
    keyParameters: [
      { label: 'Chemistry', value: 'Alkaline Permanganate (KMnO4)' },
      { label: 'Plasma Gas', value: 'CF4 / O2 Plasma Desmear Option' },
      { label: 'Etchback Depth', value: '0.2 – 0.5 mil (5 – 13 µm)' },
    ],
    qualityCheckpoint: 'Hole wall cleanliness test and 3-point micro-etch exposure check.',
    ipcStandard: 'IPC-TM-650 2.1.1',
  },
  {
    stepNumber: 11,
    title: 'PTH Copper Plating',
    stageName: 'Electroless Copper Deposition',
    phase: 'Plating & Outer Layer',
    icon: Zap,
    shortDesc: 'A micro-thin layer of conductive copper (0.5 – 1.0 µm) is autocatalytically deposited onto non-conductive glass epoxy hole walls through chemical immersion tanks.',
    technicalDetails: 'Prepares through-hole barrels for heavy electrolytic pattern plating by rendering all drilled holes electrically conductive from top outer to bottom outer surfaces.',
    keyParameters: [
      { label: 'Bath Chem', value: 'Formaldehyde Copper Sulfate Redox' },
      { label: 'Immersion Thickness', value: '0.5 – 1.0 µm conductive seed' },
      { label: 'Coverage Audit', value: 'Backlight inspection score 9.5/10' },
    ],
    qualityCheckpoint: 'Backlight glass cylinder test to verify complete void-free hole barrel coverage.',
    ipcStandard: 'IPC-6012 Hole Wall Plating Spec',
  },
  {
    stepNumber: 12,
    title: 'Outer Layer Imaging',
    stageName: 'Dry Film Lamination & Positive Exposure',
    phase: 'Plating & Outer Layer',
    icon: Sparkles,
    shortDesc: 'Outer surfaces are coated with dry film resist and exposed to UV lasers via LDI, transferring the outer trace routing and surface-mount pad pattern.',
    technicalDetails: 'Unlike inner layers, outer imaging uses a positive pattern resist where pads and holes remain exposed for subsequent heavy galvanic copper plating.',
    keyParameters: [
      { label: 'Process Pattern', value: 'Positive Image Exposure' },
      { label: 'LDI Resolution', value: 'Fine-pitch 3 mil trace & gap' },
      { label: 'Developing Sol', value: '1.0% Na2CO3 @ 30°C' },
    ],
    qualityCheckpoint: 'Developing cleanliness, resist sidewall verticality, and pad centering check.',
    ipcStandard: 'IPC-2221B / IPC-6012',
  },
  {
    stepNumber: 13,
    title: 'Pattern Plating',
    stageName: 'Electrolytic Copper & Tin Bar Plating',
    phase: 'Plating & Outer Layer',
    icon: Flame,
    shortDesc: 'Panels are submerged in electroplating baths; electrical current plates 20 – 25 µm of copper into hole barrels and onto traces, followed by a thin protective tin cap.',
    technicalDetails: 'Tin acts as an etching resist barrier protecting traces and through-holes while leaving background unwanted base copper exposed for outer etching.',
    keyParameters: [
      { label: 'Barrel Copper', value: '20 – 25 µm minimum (IPC Class 3)' },
      { label: 'Current Density', value: '15 – 22 ASF (Amperes / Sq Ft)' },
      { label: 'Tin Resist Cap', value: '4 – 7 µm pure tin electroplate' },
    ],
    qualityCheckpoint: 'Cross-section micro-metallurgical coupon audit for hole barrel copper thickness.',
    ipcStandard: 'IPC-6012 Class 3 (≥20 µm Barrel Cu)',
  },
  {
    stepNumber: 14,
    title: 'Outer Layer Etching',
    stageName: 'SES Line (Strip - Etch - Strip Tin)',
    phase: 'Plating & Outer Layer',
    icon: Flame,
    shortDesc: 'Outer dry film resist is stripped, background unwanted copper foil is etched away with alkaline solution, and the protective tin cap is chemically stripped.',
    technicalDetails: 'Alkaline chemistry will not attack the tin plating, selectively removing only unwanted base copper. Once etching is finished, nitric-acid-based tin stripper reveals clean copper traces.',
    keyParameters: [
      { label: 'Alkaline Etchant', value: 'Ammoniacal Copper Chloride pH 8.3' },
      { label: 'Etch Factor', value: '≥ 3.0 (Straight sidewall geometry)' },
      { label: 'Tin Stripper', value: 'Nitric-Fluoboric acid formulation' },
    ],
    qualityCheckpoint: 'Trace width laser micrometry and isolated conductor spacing verification.',
    ipcStandard: 'IPC-A-600K / IPC-TM-650',
  },
  {
    stepNumber: 15,
    title: 'AOI Inspection',
    stageName: 'Outer Layer Automated Optical Inspection',
    phase: 'Plating & Outer Layer',
    icon: Eye,
    shortDesc: 'High-resolution AOI scanners inspect finished outer copper conductor traces, surface mount pads, annular rings, and solder bridge clearances.',
    technicalDetails: 'Utilizes multi-angle lighting (white, red, blue LED illumination) to inspect copper surfaces and hole barrels for opens, shorts, pad slivers, and foreign material.',
    keyParameters: [
      { label: 'Vision Hardware', value: 'Multi-head 3D CMOS telecentric lenses' },
      { label: 'Inspection Speed', value: '60 Panels / Hour per machine' },
      { label: 'Verification', value: 'Dual-monitor visual verification station' },
    ],
    qualityCheckpoint: 'Zero-escape trace defects before non-reversible solder mask application.',
    ipcStandard: 'IPC-6012E Class 3',
  },
  {
    stepNumber: 16,
    title: 'Solder Mask Printing',
    stageName: 'Liquid Photo-Imageable (LPI) Solder Mask',
    phase: 'Solder Mask & Finish',
    icon: Brush,
    shortDesc: 'High-grade liquid photo-imageable solder resist ink (Green, Blue, Black, Matte) is screen-printed, pre-baked, exposed with LDI, developed, and UV/thermally cured.',
    technicalDetails: 'Covers and protects copper tracks against environmental oxidation, moisture, corrosion, and prevents solder bridges during SMT component wave/reflow soldering.',
    keyParameters: [
      { label: 'Mask Ink Type', value: 'Taiyo PSR-4000 series LPI' },
      { label: 'Mask Thickness', value: '15 – 25 µm over traces / 10 µm over corners' },
      { label: 'Final Bake Cure', value: '150°C for 60 Minutes' },
    ],
    qualityCheckpoint: 'Cross-hatch tape adhesion test (100/100 pass) and solder dam integrity check.',
    ipcStandard: 'IPC-SM-840E Class T & H',
  },
  {
    stepNumber: 17,
    title: 'Legend / Silkscreen Printing',
    stageName: 'Component Identifiers & Text Marking',
    phase: 'Solder Mask & Finish',
    icon: FileCode2,
    shortDesc: 'High-definition digital inkjet printers apply component reference designators, Walton quality logos, polarity markers, barcode/QR tracking, and pin-1 symbols.',
    technicalDetails: 'Cured instantly with UV LED pinning followed by convection baking, ensuring razor-sharp contrast and indelible resistance against cleaning solvents and flux.',
    keyParameters: [
      { label: 'Print Method', value: 'Continuous piezo drop-on-demand inkjet' },
      { label: 'Ink Color', value: 'High-opacity brilliant white / black' },
      { label: 'Resolution', value: '720 x 1440 DPI fine line text' },
    ],
    qualityCheckpoint: 'Solvent resistance wipe test (IPA & Bioact) and visual legibility inspection.',
    ipcStandard: 'IPC-A-600 Section 3.3',
  },
  {
    stepNumber: 18,
    title: 'Surface Finish',
    stageName: 'OSP / HASL / ENIG Protective Coating',
    phase: 'Solder Mask & Finish',
    icon: Sparkles,
    shortDesc: 'Exposed copper pads receive protective solderable metallic or organic finish: OSP (Organic Solderability Preservative), Lead-Free HASL, or ENIG (Electroless Nickel Immersion Gold).',
    technicalDetails: 'Protects bare copper from oxidation during storage and provides ultra-flat co-planar surface for high-density 0201/BGA SMT assembly component placement.',
    keyParameters: [
      { label: 'ENIG Spec', value: 'Nickel 3 – 5 µm / Immersion Gold 0.05 – 0.1 µm' },
      { label: 'HASL Lead-Free', value: 'Sn-Cu-Ni alloy (Hot Air Solder Leveling)' },
      { label: 'OSP Thickness', value: '0.2 – 0.5 µm organic active layer' },
    ],
    qualityCheckpoint: 'XRF (X-Ray Fluorescence) thickness measurement and solderability dip test.',
    ipcStandard: 'IPC-4552 (ENIG) / IPC-J-STD-003',
  },
  {
    stepNumber: 19,
    title: 'Routing / V-Cut',
    stageName: 'CNC Profiling & Precision V-Grooving',
    phase: 'Testing & Quality Inspection',
    icon: Maximize2,
    shortDesc: 'Production working panels are milled and profiled into customer delivery array sizes or individual boards using diamond CNC routers and precision V-scoring blades.',
    technicalDetails: 'V-cut depth leaves exact 1/3 web thickness (±0.05mm) for effortless clean breakaway after downstream automated PCBA SMT assembly lines.',
    keyParameters: [
      { label: 'CNC Spindle', value: 'Diamond coated router bit 2.0 / 2.4 mm' },
      { label: 'V-Groove Angle', value: '30° / 45° scoring blade geometry' },
      { label: 'Outline Tolerance', value: '± 0.10 mm (± 0.004 inch)' },
    ],
    qualityCheckpoint: 'Coordinate Measuring Machine (CMM) dimensional verification.',
    ipcStandard: 'IPC-TM-650 2.2.14.1',
  },
  {
    stepNumber: 20,
    title: 'Electrical Test (E-Test)',
    stageName: 'Flying Probe & Bed-of-Nails Testing',
    phase: 'Testing & Quality Inspection',
    icon: Zap,
    shortDesc: '100% of finished bare PCB circuits undergo rigorous automated electrical continuity and isolation testing against the original CAD netlist.',
    technicalDetails: 'High-voltage testing verifies zero short circuits between independent nets and zero open connections along delicate signal traces down to 50V–250V dielectric thresholds.',
    keyParameters: [
      { label: 'Test Method', value: 'Flying Probe (Prototypes) / Universal Grid Fixture' },
      { label: 'Test Voltage', value: '50V – 250V Isolation Test' },
      { label: 'Continuity Thresh', value: '< 10 – 25 Ohms continuity' },
    ],
    qualityCheckpoint: '100% Netlist Match; certified stamp placed on tested panel rails.',
    ipcStandard: 'IPC-9252B Guidelines',
  },
  {
    stepNumber: 21,
    title: 'Final Inspection',
    stageName: 'Visual & Dimensional Quality Assurance',
    phase: 'Testing & Quality Inspection',
    icon: ShieldCheck,
    shortDesc: 'Certified quality inspectors perform detailed microscopic visual audits (10X–40X magnification), checking aesthetics, cleanliness, warp & twist, and solder mask registration.',
    technicalDetails: 'Warp and twist is tested on precision granite surface table with feeler gauges to ensure flatness < 0.75% for flawless automated pick-and-place operation.',
    keyParameters: [
      { label: 'Magnification', value: '10X – 40X stereo microscope' },
      { label: 'Flatness Standard', value: '< 0.75% warp and twist limit' },
      { label: 'Physical Sample', value: 'Microsection cross-section coupon verification' },
    ],
    qualityCheckpoint: 'Defect containment audit per IPC-A-600 Class 3 acceptance criteria.',
    ipcStandard: 'IPC-A-600K Class 3',
  },
  {
    stepNumber: 22,
    title: 'FQC Approval',
    stageName: 'Final Quality Control & Certification',
    phase: 'Testing & Quality Inspection',
    icon: CheckCircle2,
    shortDesc: 'Senior Quality Assurance managers review all fabrication traceability logs, microsection lab test reports, solderability certificates, and issue official Walton Certificate of Conformance (CoC).',
    technicalDetails: 'Compilation of full quality dossier: E-test certificates, RoHS/REACH compliance declarations, impedance coupons TDR test reports, and customer acceptance documentation.',
    keyParameters: [
      { label: 'Dossier Docs', value: 'Certificate of Conformance (CoC), RoHs, REACH' },
      { label: 'Impedance Report', value: 'TDR controlled impedance validation curve' },
      { label: 'Sign-off Lead', value: 'QM Division Head Authorized Stamp' },
    ],
    qualityCheckpoint: '100% QA release approval before goods transfer to shipping logistics.',
    ipcStandard: 'ISO 9001:2015 / ISO 14001',
  },
  {
    stepNumber: 23,
    title: 'Packing & Shipment',
    stageName: 'Vacuum ESD Packaging & Logistics Dispatch',
    phase: 'Testing & Quality Inspection',
    icon: PackageCheck,
    shortDesc: 'Finished PCBs are sealed in anti-static moisture barrier bags (MBB) with silica gel desiccant packs and humidity indicator cards (HIC), boxed with foam shock protectors, and dispatched.',
    technicalDetails: 'Vacuum sealing prevents copper and surface finish oxidation during transit. Outer heavy-duty corrugated cartons are labelled with batch tracking barcodes and palletized for export or internal SMT transfer.',
    keyParameters: [
      { label: 'Bag Type', value: 'Multi-layer Aluminum Foil ESD Moisture Barrier' },
      { label: 'Protection', value: 'Silica gel desiccant + Humidity card (HIC)' },
      { label: 'Traceability Label', value: 'Batch Lot Barcode & QR Code Identification' },
    ],
    qualityCheckpoint: 'Packaging seal vacuum test and gross box drop test certification.',
    ipcStandard: 'IPC-1601 / EIA-583',
  },
];

interface PCBProcessFlowViewProps {
  onNavigate?: (page: PageId) => void;
}

export const PCBProcessFlowView: React.FC<PCBProcessFlowViewProps> = ({
  onNavigate = (_page: PageId) => {},
}) => {
  const [selectedStep, setSelectedStep] = useState<PCBProcessStep>(PCB_PROCESS_FLOW[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');

  const phases = [
    'ALL',
    'Pre-Production & CAM',
    'Inner Layer Fabrication',
    'Lamination & Drilling',
    'Plating & Outer Layer',
    'Solder Mask & Finish',
    'Testing & Quality Inspection',
  ];

  const filteredSteps = PCB_PROCESS_FLOW.filter((s) => {
    const matchesPhase = phaseFilter === 'ALL' || s.phase === phaseFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stepNumber.toString() === searchQuery.trim();
    return matchesPhase && matchesSearch;
  });

  return (
    <div id="page-pcb-process-flow" className="space-y-6 animate-in fade-in duration-200">
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
              onClick={() => onNavigate('pcb')}
              className="text-xs font-bold text-[#1c356b] hover:text-[#e35b2a] transition-colors cursor-pointer"
            >
              PCB Quality
            </button>
            <span className="text-xs text-[#94a3b8]">/</span>
            <span className="text-xs font-semibold text-[#5b6480]">Manufacturing Process Flow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d1730] tracking-tight flex items-center gap-3">
            <span>PCB Manufacturing Process Flow</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
              23 Step Sequence
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5b6480] mt-0.5">
            Walton Hi-Tech Industries PLC · High-Precision Bare Board PCB Fabrication &amp; Quality Inspection Pipeline
          </p>
        </div>

        {/* Quick Navigation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('pcb')}
            className="px-4 py-2 bg-white hover:bg-[#f1f5f9] text-[#1c356b] font-bold text-xs rounded-xl border border-[#cbd5e1] shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PCB Quality Metrics</span>
          </button>
          <button
            onClick={() => onNavigate('pcba')}
            className="px-4 py-2 bg-[#1c356b] hover:bg-[#152a55] text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Go to PCBA</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#e0f2fe] text-[#0369a1]">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Input Format</div>
            <div className="text-sm font-bold text-[#0d1730]">Customer Gerber</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#fef3c7] text-[#b45309]">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Optical Quality</div>
            <div className="text-sm font-bold text-[#0d1730]">Dual AOI Gates</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#dcfce7] text-[#15803d]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Electrical Audit</div>
            <div className="text-sm font-bold text-[#0d1730]">100% E-Test Netlist</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f1f5f9] text-[#475569]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748b] font-medium">Compliance Grade</div>
            <div className="text-sm font-bold text-[#0d1730]">IPC Class 2 &amp; 3</div>
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
            placeholder="Search process step..."
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
                  <span>Manufacturing Flow Pipeline</span>
                  <span className="text-xs font-mono font-normal text-[#64748b]">
                    ({filteredSteps.length} of 23 steps)
                  </span>
                </h3>
                <p className="text-[11px] text-[#64748b]">Click any step to inspect technical details</p>
              </div>
            </div>

            {/* Vertical Flowchart Steps */}
            <div className="relative pl-4 sm:pl-6 space-y-2 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#cbd5e1]">
              {filteredSteps.map((step, idx) => {
                const isSelected = selectedStep.stepNumber === step.stepNumber;
                const IconComponent = step.icon;

                return (
                  <div key={step.stepNumber} className="relative">
                    {/* Step Card Item */}
                    <div
                      onClick={() => setSelectedStep(step)}
                      className={`relative z-10 p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#f0f9ff] border-[#0284c7] shadow-sm ring-1 ring-[#0284c7]'
                          : 'bg-white hover:bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    >
                      {/* Step Number Badge */}
                      <div
                        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono font-extrabold text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#0284c7] text-white shadow-xs'
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
                              isSelected ? 'text-[#0369a1]' : 'text-[#0d1730]'
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
                          isSelected ? 'text-[#0284c7] translate-x-0.5' : 'text-[#cbd5e1]'
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
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold bg-[#e0f2fe] text-[#0369a1]">
                      STEP {selectedStep.stepNumber.toString().padStart(2, '0')} OF 23
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
                    const prev = PCB_PROCESS_FLOW.find((s) => s.stepNumber === selectedStep.stepNumber - 1);
                    if (prev) setSelectedStep(prev);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[#1c356b] cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={selectedStep.stepNumber === 23}
                  onClick={() => {
                    const next = PCB_PROCESS_FLOW.find((s) => s.stepNumber === selectedStep.stepNumber + 1);
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
                Technical Manufacturing Mechanics
              </h4>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {selectedStep.technicalDetails}
              </p>
            </div>

            {/* Key Parameters Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d1730]">
                Critical Process Engineering Parameters
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

          {/* Quick Flow Schematic ASCII / Diagram Reference Banner */}
          <div className="bg-[#0f172a] rounded-2xl p-4 sm:p-5 text-white border border-[#334155] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#38bdf8] flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Complete 23-Stage Sequence Roadmap</span>
              </span>
              <span className="text-[10px] text-[#94a3b8] font-mono">Walton Fabrication Facility</span>
            </div>
            <div className="text-[11px] text-[#94a3b8] leading-relaxed">
              Every production panel travels sequentially through all 23 stages under strict ISO 9001:2015 and IPC-A-600 Class 3 controls before entering downstream SMT PCBA assembly lines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
