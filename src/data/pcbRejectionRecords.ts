export interface PcbRejectionRecord {
  id?: string;
  sl: number;
  partNo: string;
  production: number;
  rejection: number;
  rejectionRate: number; // percentage, e.g. 3.65
  period?: string; // 'Jan-26 to Oct-26'
  isHighRejection?: boolean; // highlighted in yellow (e.g. >= 2.0%)
  updatedAt?: string;
}

export const INITIAL_PCB_REJECTION_RECORDS: PcbRejectionRecord[] = [
  { sl: 1, partNo: 'Smart Controller', production: 236259, rejection: 8627, rejectionRate: 3.65, isHighRejection: true },
  { sl: 2, partNo: 'SC Power Board', production: 307741, rejection: 2615, rejectionRate: 0.85 },
  { sl: 3, partNo: 'CFL_V07', production: 82696, rejection: 187, rejectionRate: 0.23 },
  { sl: 4, partNo: 'SMPS US V3', production: 165946, rejection: 1022, rejectionRate: 0.62 },
  { sl: 5, partNo: 'Square LED (RLSS) 3 Chip', production: 339650, rejection: 2749, rejectionRate: 0.81 },
  { sl: 6, partNo: 'RL-RS35-V04', production: 617538, rejection: 5333, rejectionRate: 0.86 },
  { sl: 7, partNo: 'WRDC2S2', production: 79579, rejection: 1003, rejectionRate: 1.26 },
  { sl: 8, partNo: '12VDC Square LED', production: 50000, rejection: 148, rejectionRate: 0.30 },
  { sl: 9, partNo: '17" LPF SMD Fan', production: 40008, rejection: 328, rejectionRate: 0.82 },
  { sl: 10, partNo: 'Solar (2912)', production: 20135, rejection: 83, rejectionRate: 0.41 },
  { sl: 11, partNo: 'Rice Cooker', production: 110531, rejection: 55, rejectionRate: 0.05 },
  { sl: 12, partNo: 'Trust Regulator', production: 20088, rejection: 204, rejectionRate: 1.02 },
  { sl: 13, partNo: 'Hi Speed Fan', production: 129054, rejection: 1008, rejectionRate: 0.78 },
  { sl: 14, partNo: 'Piano P1-V1.2', production: 793105, rejection: 2539, rejectionRate: 0.32 },
  { sl: 15, partNo: 'Fiona WH138 V1.2.2', production: 338669, rejection: 626, rejectionRate: 0.18 },
  { sl: 16, partNo: 'Fiona M2', production: 145750, rejection: 130, rejectionRate: 0.09 },
  { sl: 17, partNo: 'A8E4-138-R16 (XPC)', production: 54255, rejection: 65, rejectionRate: 0.12 },
  { sl: 18, partNo: 'W1-V1.2', production: 8000, rejection: 14, rejectionRate: 0.18 },
  { sl: 19, partNo: 'Glory + Luxur', production: 49269, rejection: 9, rejectionRate: 0.02 },
  { sl: 20, partNo: 'Freeze_Constant Fan Dimmer', production: 40000, rejection: 48, rejectionRate: 0.12 },
  { sl: 21, partNo: 'Beverage Cooler L290-V3', production: 112458, rejection: 304, rejectionRate: 0.27 },
  { sl: 22, partNo: 'Ionizer LED (RPIL 619L)', production: 16062, rejection: 450, rejectionRate: 2.80, isHighRejection: true },
  { sl: 23, partNo: 'Ionizer LED (SBS 656)', production: 4038, rejection: 23, rejectionRate: 0.57 },
  { sl: 24, partNo: 'SBS 656 (RPDHL+RFDHL)', production: 2432, rejection: 16, rejectionRate: 0.66 },
  { sl: 25, partNo: 'Redmin Toy Controller', production: 30182, rejection: 112, rejectionRate: 0.37 },
  { sl: 26, partNo: 'R-LED-PCCL', production: 37681, rejection: 439, rejectionRate: 1.17 },
  { sl: 27, partNo: 'Rotary Step Switch', production: 14810, rejection: 58, rejectionRate: 0.39 },
  { sl: 28, partNo: 'WR-343-CTW-LED-V2', production: 22512, rejection: 66, rejectionRate: 0.29 },
  { sl: 29, partNo: 'Beverage Cooler (337)', production: 93500, rejection: 422, rejectionRate: 0.45 },
  { sl: 30, partNo: 'UHK Trade SS Regulator', production: 362843, rejection: 1869, rejectionRate: 0.52 },
  { sl: 31, partNo: 'Akij SS Regulator', production: 10300, rejection: 20, rejectionRate: 0.19 },
  { sl: 32, partNo: 'SS 22', production: 937070, rejection: 691, rejectionRate: 0.07 },
  { sl: 33, partNo: '4 Feet (2P50C)', production: 51547, rejection: 327, rejectionRate: 0.63 },
  { sl: 34, partNo: '0.5 Feet Double Pad', production: 59883, rejection: 177, rejectionRate: 0.30 },
  { sl: 35, partNo: '1 Feet DTDL', production: 48868, rejection: 388, rejectionRate: 0.79 },
  { sl: 36, partNo: '2 Feet 20W', production: 20369, rejection: 400, rejectionRate: 1.96 },
  { sl: 37, partNo: 'SP 12W Round', production: 74274, rejection: 709, rejectionRate: 0.95 },
  { sl: 38, partNo: 'Remote New', production: 50805, rejection: 1873, rejectionRate: 3.69, isHighRejection: true },
  { sl: 39, partNo: 'Tracker V1_1 Remote', production: 5067, rejection: 113, rejectionRate: 2.23, isHighRejection: true },
  { sl: 40, partNo: 'Moon Light PCB-0.5w', production: 76212, rejection: 124, rejectionRate: 0.16 },
  { sl: 41, partNo: 'Electronic Thermostat V2', production: 20000, rejection: 52, rejectionRate: 0.26 },
  { sl: 42, partNo: 'TV Socket', production: 22333, rejection: 59, rejectionRate: 0.26 },
  { sl: 43, partNo: 'Computer Mouse', production: 815, rejection: 8, rejectionRate: 0.98 },
  { sl: 44, partNo: '4 Feet (2P48C)', production: 2661, rejection: 9, rejectionRate: 0.34 },
  { sl: 45, partNo: '4 Feet (40W DTDL)', production: 95283, rejection: 225, rejectionRate: 0.24 },
  { sl: 46, partNo: 'Smile & Micky (RFL)', production: 30000, rejection: 128, rejectionRate: 0.43 },
  { sl: 47, partNo: 'FC Panel (RFPL-619L)', production: 9729, rejection: 34, rejectionRate: 0.35 },
  { sl: 48, partNo: 'PC Panel (RPPL-619L)', production: 9730, rejection: 16, rejectionRate: 0.16 },
  { sl: 49, partNo: 'Battery changeable PCB-12W', production: 48744, rejection: 227, rejectionRate: 0.47 },
  { sl: 50, partNo: 'Common Toy LED Driver (Talukder)', production: 98479, rejection: 107, rejectionRate: 0.11 },
  { sl: 51, partNo: 'Common Toy LED Controller (Talukder)', production: 79695, rejection: 235, rejectionRate: 0.29 },
  { sl: 52, partNo: 'TKG Button (Talukder)', production: 82377, rejection: 80, rejectionRate: 0.10 },
  { sl: 53, partNo: 'Rock Rider SW (RFL)', production: 30587, rejection: 13, rejectionRate: 0.04 },
  { sl: 54, partNo: 'Capacitive Fan Regulator (RFL)', production: 30113, rejection: 67, rejectionRate: 0.22 },
  { sl: 55, partNo: 'TOTO Walker Main (RFL)', production: 6000, rejection: 240, rejectionRate: 4.00, isHighRejection: true },
  { sl: 56, partNo: 'TOTO Walker SW (RFL)', production: 6000, rejection: 240, rejectionRate: 4.00, isHighRejection: true },
  { sl: 57, partNo: 'Twinkle Walker Main (RFL)', production: 10289, rejection: 33, rejectionRate: 0.32 },
  { sl: 58, partNo: 'Twinkle Walker Switch (RFL)', production: 10032, rejection: 0, rejectionRate: 0.00 },
  { sl: 59, partNo: 'Happy Walker V-NC-1 (RFL)', production: 20120, rejection: 40, rejectionRate: 0.20 },
  { sl: 60, partNo: 'Mobile Charger 500mA', production: 148871, rejection: 1047, rejectionRate: 0.70 },
  { sl: 61, partNo: 'Mobile Charger 2A', production: 29769, rejection: 221, rejectionRate: 0.74 },
  { sl: 62, partNo: 'Super Star Reg', production: 20032, rejection: 68, rejectionRate: 0.34 },
  { sl: 63, partNo: 'Akij Toy Controller-V1.0', production: 66433, rejection: 342, rejectionRate: 0.51 },
  { sl: 64, partNo: 'Akij Button', production: 79892, rejection: 44, rejectionRate: 0.06 },
  { sl: 65, partNo: 'Common Toy LED Driver (Akij)', production: 115266, rejection: 591, rejectionRate: 0.51 },
  { sl: 66, partNo: 'Golden Wheel Controller', production: 25515, rejection: 245, rejectionRate: 0.96 },
  { sl: 67, partNo: 'Golden Wheel Button', production: 20734, rejection: 2, rejectionRate: 0.01 },
  { sl: 68, partNo: 'Cycle Fan IR', production: 1922, rejection: 34, rejectionRate: 1.77 },
  { sl: 69, partNo: 'ACI-Spider Bike', production: 10318, rejection: 1, rejectionRate: 0.01 },
];

export const PCB_REJECTION_STORAGE_KEY = 'walton_pcb_rejection_report_2026';

export function getInitialPcbRejectionRecords(): PcbRejectionRecord[] {
  try {
    const saved = localStorage.getItem(PCB_REJECTION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading saved PCB rejection records from localStorage:', err);
  }
  return INITIAL_PCB_REJECTION_RECORDS;
}

export function savePcbRejectionRecords(records: PcbRejectionRecord[]): void {
  try {
    localStorage.setItem(PCB_REJECTION_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Error saving PCB rejection records to localStorage:', err);
  }
}
