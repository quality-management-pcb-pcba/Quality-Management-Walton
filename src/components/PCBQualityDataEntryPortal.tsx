import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Settings, Database, X } from 'lucide-react';
import { WaltonSealLogo } from './WaltonSealLogo';
import {
  savePcbSheetRowsToFirestore,
  loadPcbSheetRowsFromFirestore,
  createPcbRecord,
} from '../services/pcbRecords';

export interface PCBQualityDataEntryPortalProps {
  onClose: () => void;
  onNavigateHome?: () => void;
  initialGate?: 'FQC' | 'AOI' | 'ETEST';
  initialNav?: 'report-entry' | 'defect-entry';
  initialLine?: string;
}

type SheetKey = 'visual' | 'aoi' | 'receive' | 'delivery';
type PageKey = 'home' | 'database' | SheetKey;

interface PageConfig {
  name: string;
  badge: string;
  badgeClass: string;
  cols: string[];
  req: string[];
  storageKey: string;
  hint?: string;
}

const MODELS: string[] = [
  '0.5 Feet Double Pad',
  '1 Feet DTDL',
  '12V DC+ Deep',
  '12VDC Square LED',
  '17" LPF SMD Fan',
  '2 Feet 20W',
  '4 Feet (2P50C)',
  '4 Feet (40W DTDL)',
  'A8E4-138-R16 (XPC)',
  'Advance Trading',
  'Akij Button',
  'Akij Toy Controller-V1.0',
  'Arat Technology AR2',
  'BJIT Safpro',
  'Battery Changeable',
  'Battery changeable PCB-12W',
  'Beverage Cooler (337)',
  'Beverage Cooler L290-V3',
  'CFL_V07',
  'Cherger Controller',
  'Common Toy LED Controller (Talukder)',
  'Common Toy LED Driver (Akij)',
  'Common Toy LED Driver (Talukder)',
  'Dissolve Display',
  'Dutch IPS',
  'Dutch IPS PCB',
  'EPS-Power IPS',
  'Electronic Thermostat V2',
  'FC Panel (RFPL-619L)',
  'Fiona M2',
  'Fiona WH138 V1.2.2',
  'Frost Controller with Indicator',
  'Garber N 9721',
  'Genarel IPS 8 mos',
  'General IPS',
  'General IPS HIP 4082 & F26LCD',
  'Gerber N9721 Sohag',
  'Glory + Luxur',
  'Golden Wheel Controller',
  'Golden Wheel Toy Controller',
  'HN Power Sukam',
  'Happy Walker V-NC-1 (RFL)',
  'IOT SCDIS With Indicator',
  'Ionizer Blue',
  'Ionizer LED (RPIL 619L)',
  'Ionizer LED (SBS 656)',
  'KHI 12/24 Sinewave',
  'Keya Home IPS',
  'Keya Homes IPS',
  'Ligal Power',
  'Ligal Power Ips',
  'Ma Electronics',
  'Masudur Key Pad',
  'Mobile Charger 2A',
  'Mobile Charger 500mA',
  'Modern Power',
  'Modern Power IPS',
  'Moon Light PCB-0.5w',
  'Multi 3 Model',
  'Multi 3 Model Compressor & Freeze',
  'Multi 3Model GAS DIP+SNM+Low',
  'Multi 3Model IPS',
  'Multi 6 Model',
  'Multi ARFA+General IPS+TSK Power',
  'Multi Gardian Masadur+Shahinur+SW+Gerber N9721(sohag)',
  'Multi HN Dsp',
  'Multi RH-M1&RH-M2',
  'Multi Robin 2 Model',
  'Multi Sun Power Model-1 & GILDAN_HMI',
  'Multi sun power gardian',
  'PC Panel (RPPL-619L)',
  'Piano P1-V1.2',
  'R-LED-PCCL',
  'RL-RS35-V04',
  'Redmin Toy Controller',
  'Reed Sensor',
  'Remote New',
  'Rice Cooker',
  'Rotary Step Switch',
  'SBS 656 (RPDHL+RFDHL)',
  'SBS-RFPL 619L',
  'SC DIS-with Indicator',
  'SC Power Board',
  'SK 200111',
  'SK Alif Elections',
  'SK Alif Sukam',
  'SK PS 22 M1',
  'SK PS 22 M2',
  'SK-Alif Electronics(SK200903+4+5+6)',
  'SMPS US V3',
  'SNM',
  'SP 12W Round',
  'SS 22',
  'ST010 EPAC',
  'Safety Plus-1725',
  'Samcon',
  'Samcon B-0966',
  'Samcon B-9762',
  'Samcon B-9766',
  'Samcon B-9889',
  'Smart Controller',
  'Smile & Micky (RFL)',
  'Smps Us small',
  'Solar (2912)',
  'Spot Down 7W LED',
  'Spot Down 7W round',
  'Square LED (RLSS) 3 Chip',
  'Sun Power M 2',
  'Sun Power Model-2',
  'Sun Power Model-2 PCB',
  'T.S Power Ips',
  'TKG Button (Talukder)',
  'TS Power',
  'TV Socket',
  'Tip Top Electronics',
  'Trust Regulator',
  'UHK Trade SS Regulator',
  'WR-343-CTW-LED-V2',
  'WRDC2S2',
  'Wybli-WDC 26098',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PAGES: Record<SheetKey, PageConfig> = {
  visual: {
    name: 'Visual Check',
    badge: 'AOI',
    badgeClass: 'bg-[#2f6fd0]',
    cols: [
      'Date',
      'Month',
      'Model',
      'Total Check',
      'Pass QTY',
      'Fail QTY',
      'Fail percentage',
      'Product',
      'Layer',
    ],
    req: ['Date', 'Model', 'Total Check'],
    storageKey: 'walton-fqc-visual',
  },
  aoi: {
    name: 'AOI',
    badge: 'Panel',
    badgeClass: 'bg-[#2f6fd0]',
    cols: [
      'Date',
      'Month',
      'Model',
      'Pass (Panel)',
      'Short',
      'Open',
      'Fail (Panel)',
      'Total Check (Panel)',
      'Pass Ratio',
      'Fail Ratio',
      'Product',
      'Layer',
    ],
    req: ['Date', 'Model'],
    storageKey: 'walton-fqc-aoi',
    hint: 'Fail(Panel), Total, Pass/Fail Ratio calculate automatically',
  },
  receive: {
    name: 'Receive',
    badge: 'IQC',
    badgeClass: 'bg-[#1e9e6b]',
    cols: ['Date', 'Month', 'Model', 'Receive QTY', 'Product', 'Layer', 'Material'],
    req: ['Date', 'Model', 'Receive QTY'],
    storageKey: 'walton-fqc-receive',
  },
  delivery: {
    name: 'Delivery',
    badge: 'OQC',
    badgeClass: 'bg-[#e08e2b]',
    cols: ['Date', 'Month', 'Model', 'Delivery QTY', 'Product', 'Layer', 'Material'],
    req: ['Date', 'Model', 'Delivery QTY'],
    storageKey: 'walton-fqc-delivery',
  },
};

const SHEET_KEYS: SheetKey[] = ['visual', 'aoi', 'receive', 'delivery'];

function num(v: unknown): number {
  const n = parseFloat(String(v ?? ''));
  return isNaN(n) ? 0 : n;
}

function pct(n: number, d: number): string {
  return d ? ((n / d) * 100).toFixed(2) + '%' : '0.00%';
}

function getMonthFromDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return MONTHS[d.getMonth()] || '';
}

function downloadCSV(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const PCBQualityDataEntryPortal: React.FC<PCBQualityDataEntryPortalProps> = ({
  onClose,
  initialGate,
  initialNav,
}) => {
  const defaultPage = useMemo<PageKey>(() => {
    if (initialNav === 'defect-entry') {
      if (initialGate === 'AOI') return 'aoi';
      return 'visual';
    }
    return 'home';
  }, [initialGate, initialNav]);

  const [activePage, setActivePage] = useState<PageKey>(defaultPage);
  const [groupCollapsed, setGroupCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Store for all 4 sheets persisted in localStorage under exact keys from attached file
  const [store, setStore] = useState<Record<SheetKey, Record<string, string>[]>>(() => {
    const init: Record<SheetKey, Record<string, string>[]> = {
      visual: [],
      aoi: [],
      receive: [],
      delivery: [],
    };
    SHEET_KEYS.forEach((k) => {
      try {
        const raw = localStorage.getItem(PAGES[k].storageKey);
        if (raw) init[k] = JSON.parse(raw);
      } catch {}
    });
    return init;
  });

  // Load sheets from Firestore on mount if available
  useEffect(() => {
    SHEET_KEYS.forEach((k) => {
      loadPcbSheetRowsFromFirestore(k).then((rows) => {
        if (rows && rows.length > 0) {
          setStore((prev) => ({
            ...prev,
            [k]: rows,
          }));
        }
      });
    });
  }, []);

  // Persist each sheet whenever store changes
  useEffect(() => {
    SHEET_KEYS.forEach((k) => {
      try {
        localStorage.setItem(PAGES[k].storageKey, JSON.stringify(store[k]));
      } catch {}
    });
  }, [store]);

  // Entry form state
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [formValues, setFormValues] = useState<Record<string, string>>(() => ({
    Date: todayStr,
    Month: getMonthFromDate(todayStr),
  }));
  const [formError, setFormError] = useState(false);
  const [confirmClearSheet, setConfirmClearSheet] = useState<SheetKey | null>(null);

  // Database filter state
  const [dbType, setDbType] = useState<string>('');
  const [dbSearch, setDbSearch] = useState<string>('');

  // Manage Master Lists state
  const [masterLists, setMasterLists] = useState<{
    products: string[];
    models: string[];
    layers: string[];
    materials: string[];
  }>(() => {
    const defaultLists = {
      products: ['External S', 'External', 'Fridge', 'LED Light', 'Advance Trading', 'TV', 'Fan'],
      models: [...MODELS],
      layers: ['Single Side', 'Double Side'],
      materials: ['FR-4 (SL)', 'FR-4 (DL)', 'Aluminum', 'CEM-1'],
    };
    try {
      const saved = localStorage.getItem('walton-fqc-master-lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          products: parsed.products || defaultLists.products,
          models: parsed.models || defaultLists.models,
          layers: parsed.layers || defaultLists.layers,
          materials: parsed.materials || defaultLists.materials,
        };
      }
    } catch {}
    return defaultLists;
  });

  useEffect(() => {
    try {
      localStorage.setItem('walton-fqc-master-lists', JSON.stringify(masterLists));
    } catch {}
  }, [masterLists]);

  const [showManageModal, setShowManageModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    'products' | 'models' | 'layers' | 'materials'
  >('models');
  const [newListItemInput, setNewListItemInput] = useState('');

  const handleAddListItem = () => {
    const val = newListItemInput.trim();
    if (!val) return;
    setMasterLists((prev) => {
      if (prev[activeModalTab].includes(val)) return prev;
      return {
        ...prev,
        [activeModalTab]: [...prev[activeModalTab], val],
      };
    });
    setNewListItemInput('');
  };

  const handleRemoveListItem = (tab: 'products' | 'models' | 'layers' | 'materials', item: string) => {
    setMasterLists((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((x) => x !== item),
    }));
  };

  // Reset form when switching entry sheets
  const handleSelectPage = (page: PageKey) => {
    setActivePage(page);
    setSidebarOpen(false);
    setFormError(false);
    setConfirmClearSheet(null);
    if (page !== 'home' && page !== 'database') {
      const today = new Date().toISOString().slice(0, 10);
      setFormValues({
        Date: today,
        Month: getMonthFromDate(today),
      });
    }
  };

  const updateField = (key: string, value: string, sheet: SheetKey) => {
    setFormError(false);
    setFormValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'Date') {
        next['Month'] = getMonthFromDate(value);
      }
      if (sheet === 'visual' && (key === 'Total Check' || key === 'Fail QTY')) {
        const t = num(next['Total Check']);
        const fail = num(next['Fail QTY']);
        const pass = Math.max(0, t - fail);
        next['Pass QTY'] = t ? String(pass) : '';
        next['Fail percentage'] = t ? pct(fail, t) : '';
      }
      if (sheet === 'aoi' && (key === 'Pass (Panel)' || key === 'Short' || key === 'Open')) {
        const pv = num(next['Pass (Panel)']);
        const shv = num(next['Short']);
        const opv = num(next['Open']);
        const fail = shv + opv;
        const total = pv + fail;
        next['Fail (Panel)'] = total ? String(fail) : '';
        next['Total Check (Panel)'] = total ? String(total) : '';
        next['Pass Ratio'] = total ? pct(pv, total) : '';
        next['Fail Ratio'] = total ? pct(fail, total) : '';
      }
      return next;
    });
  };

  const handleAddEntry = (sheet: SheetKey) => {
    const cfg = PAGES[sheet];
    const row: Record<string, string> = {};
    cfg.cols.forEach((c) => {
      row[c] = formValues[c] ?? '';
    });
    const missing = cfg.req.some((c) => !row[c] && row[c] !== '0');
    if (missing) {
      setFormError(true);
      return;
    }
    setFormError(false);
    setStore((prev) => {
      const nextRows = [...prev[sheet], row];
      savePcbSheetRowsToFirestore(sheet, nextRows).catch(() => {});
      return {
        ...prev,
        [sheet]: nextRows,
      };
    });
    createPcbRecord({
      sheet,
      date: row['Date'] || todayStr,
      model: row['Model'] || '',
      checkQty: num(row['Total Check'] || row['Total Check (Panel)'] || row['Receive QTY'] || row['Delivery QTY']),
      faultQty: num(row['Fail QTY'] || row['Fail (Panel)']),
      faultRate: parseFloat(String(row['Fail percentage'] || row['Fail Ratio'] || '0')),
      ...row,
    }).catch(() => {});
    // Reset fields while keeping Date & Month
    setFormValues({
      Date: formValues['Date'] || todayStr,
      Month: formValues['Month'] || getMonthFromDate(todayStr),
    });
  };

  const handleResetForm = () => {
    setFormError(false);
    setFormValues((prev) => ({
      Date: prev['Date'] || todayStr,
      Month: prev['Month'] || getMonthFromDate(todayStr),
    }));
  };

  const handleRemoveRow = (sheet: SheetKey, idx: number) => {
    setStore((prev) => {
      const nextRows = prev[sheet].filter((_, i) => i !== idx);
      savePcbSheetRowsToFirestore(sheet, nextRows).catch(() => {});
      return {
        ...prev,
        [sheet]: nextRows,
      };
    });
  };

  const handleClearLog = (sheet: SheetKey) => {
    setStore((prev) => {
      savePcbSheetRowsToFirestore(sheet, []).catch(() => {});
      return {
        ...prev,
        [sheet]: [],
      };
    });
    setConfirmClearSheet(null);
  };

  const handleExportCSV = (sheet: SheetKey) => {
    const cfg = PAGES[sheet];
    const rows = store[sheet];
    if (!rows.length) return;
    const lines = [cfg.cols.join(',')];
    rows.forEach((r) => {
      lines.push(
        cfg.cols
          .map((c) => {
            let v = r[c] !== undefined ? String(r[c]) : '';
            if (v.includes(',') || v.includes('"')) {
              v = '"' + v.replace(/"/g, '""') + '"';
            }
            return v;
          })
          .join(',')
      );
    });
    downloadCSV(
      lines.join('\n'),
      `walton-fqc-${sheet}-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  // Home KPI calculations
  const homeStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let totalRecords = 0;
    let todayRecords = 0;
    let totalFail = 0;
    let totalChecked = 0;
    SHEET_KEYS.forEach((k) => {
      store[k].forEach((r) => {
        totalRecords++;
        if (r.Date === today) todayRecords++;
        if (k === 'visual') {
          totalChecked += num(r['Total Check']);
          totalFail += num(r['Fail QTY']);
        }
        if (k === 'aoi') {
          totalChecked += num(r['Total Check (Panel)']);
          totalFail += num(r['Fail (Panel)']);
        }
      });
    });
    return {
      totalRecords,
      todayRecords,
      totalChecked,
      failRate: totalChecked ? pct(totalFail, totalChecked) : '0.00%',
    };
  }, [store]);

  // All Database rows combined & sorted
  const allDbRows = useMemo(() => {
    const all: {
      type: string;
      typeKey: SheetKey;
      date: string;
      model: string;
      qty: string;
      fail: string;
      product: string;
      layerMat: string;
    }[] = [];
    SHEET_KEYS.forEach((k) => {
      store[k].forEach((r) => {
        const qty =
          r['Total Check'] ||
          r['Total Check (Panel)'] ||
          r['Receive QTY'] ||
          r['Delivery QTY'] ||
          '';
        const fail =
          r['Fail QTY'] !== undefined
            ? r['Fail QTY']
            : r['Fail (Panel)'] !== undefined
            ? r['Fail (Panel)']
            : '—';
        const layerMat = r['Material']
          ? `${r['Layer'] || ''} / ${r['Material']}`
          : r['Layer'] || '—';
        all.push({
          type: PAGES[k].name,
          typeKey: k,
          date: r.Date || '',
          model: r.Model || '',
          qty: String(qty),
          fail: String(fail),
          product: r.Product || '—',
          layerMat,
        });
      });
    });
    all.sort((a, b) => (a.date < b.date ? 1 : -1));
    return all;
  }, [store]);

  const filteredDbRows = useMemo(() => {
    let rows = allDbRows;
    if (dbType) {
      rows = rows.filter((r) => r.typeKey === dbType);
    }
    if (dbSearch.trim()) {
      const q = dbSearch.trim().toLowerCase();
      rows = rows.filter((r) => r.model.toLowerCase().includes(q));
    }
    return rows;
  }, [allDbRows, dbType, dbSearch]);

  const handleExportDatabase = () => {
    if (!allDbRows.length) return;
    const lines = [['Type', 'Date', 'Model', 'Qty', 'Fail', 'Product', 'Layer/Material'].join(',')];
    allDbRows.forEach((r) => {
      lines.push(
        [r.type, r.date, r.model, r.qty, r.fail, r.product, r.layerMat]
          .map((v) => {
            const s = String(v || '');
            return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
          })
          .join(',')
      );
    });
    downloadCSV(
      lines.join('\n'),
      `walton-fqc-database-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#eef2f7] text-[#1c2733] font-sans text-[13.5px] leading-[1.45] overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        id="sidebar"
        className={`w-[250px] shrink-0 bg-[#0e1b30] text-[#cfd9ea] flex flex-col h-full overflow-y-auto z-50 transition-transform duration-200 fixed lg:static top-0 bottom-0 left-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#223355]">
            <div className="w-[52px] h-[52px] shrink-0 flex items-center justify-center filter drop-shadow-md">
              <WaltonSealLogo className="w-full h-full object-contain select-none" />
            </div>
            <div>
              <h1 className="text-[16px] m-0 text-white font-extrabold tracking-wide leading-tight">
                Walton
              </h1>
              <p className="m-0 mt-0.5 text-[10.5px] text-[#9db0cc] font-medium leading-[1.3]">
                Quality Management
                <br />
                PCB &amp; PCBA
              </p>
            </div>
          </div>

          {/* Group: Daily FQC Report */}
          <div className="pt-2.5 px-2 pb-1">
            <div
              onClick={() => setGroupCollapsed(!groupCollapsed)}
              className="flex items-center gap-[7px] px-2.5 py-2 text-[11.5px] font-bold text-[#e7ecf5] cursor-pointer rounded-md select-none hover:bg-[#17294a]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
                <path d="M8.5 14.5l2 2 4-4.5" />
              </svg>
              <span>Daily FQC Report</span>
              <svg
                className={`ml-auto transition-transform duration-150 shrink-0 ${
                  groupCollapsed ? '-rotate-90' : ''
                }`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {!groupCollapsed && (
              <div className="pt-0.5 pb-1.5">
                {SHEET_KEYS.map((key) => {
                  const cfg = PAGES[key];
                  const isActive = activePage === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectPage(key)}
                      className={`flex items-center gap-2 py-2 pr-3 pl-[30px] text-[12.5px] cursor-pointer border-l-[3px] transition-colors ${
                        isActive
                          ? 'bg-[#17294a] text-white border-[#1565c0] font-bold'
                          : 'border-transparent text-[#b8c5db] hover:bg-[#17294a] hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full shrink-0 ${
                          isActive ? 'bg-[#1565c0]' : 'bg-[#5b6e8c]'
                        }`}
                      />
                      <span className="flex-1 min-w-0 truncate">{cfg.name}</span>
                      <span
                        className={`text-[9px] font-bold px-[7px] py-[2px] rounded-[20px] text-white whitespace-nowrap shrink-0 ${cfg.badgeClass}`}
                      >
                        {cfg.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Foot */}
        <div className="mt-auto border-t border-[#223355]">
          <div
            onClick={() => handleSelectPage('database')}
            className={`flex items-center gap-[9px] px-4 py-2.5 text-[12.5px] cursor-pointer border-l-[3px] transition-colors ${
              activePage === 'database'
                ? 'bg-[#17294a] text-white border-[#1565c0] font-bold'
                : 'border-transparent text-[#cfd9ea] hover:bg-[#17294a]'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <ellipse cx="12" cy="5" rx="8" ry="3" />
              <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
              <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
            </svg>
            <span>Database</span>
          </div>

          <div
            onClick={() => handleSelectPage('home')}
            className={`flex items-center gap-[9px] px-4 py-2.5 text-[12.5px] cursor-pointer border-l-[3px] transition-colors ${
              activePage === 'home'
                ? 'bg-[#17294a] text-white border-[#1565c0] font-bold'
                : 'border-transparent text-[#cfd9ea] hover:bg-[#17294a]'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 11l9-7 9 7" />
              <path d="M5 10v10h14V10" />
            </svg>
            <span>Home</span>
          </div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-[#e2e8f0] px-[14px] sm:px-[26px] py-[14px] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden inline-flex bg-[#eaf2fb] text-[#123a6b] border-none rounded-[7px] px-2.5 py-2 font-bold text-sm cursor-pointer"
            >
              ☰
            </button>
            <div>
              <h2 className="m-0 text-[20px] text-[#123a6b] font-extrabold leading-tight">
                Quality Management
              </h2>
              <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                PCB &amp; PCBA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-[9px]">
              <div className="w-8 h-8 rounded-full bg-[#123a6b] text-white grid place-items-center font-bold text-[11px]">
                QC
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-[#1c2733]">FQC Inspector</div>
                <div className="text-[10.5px] text-[#64748b]">fqc.pcb@waltonbd.com</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#cbd5e1] bg-white hover:border-[#1565c0] hover:text-[#1565c0] text-[#1c2733] text-xs font-bold cursor-pointer transition-colors"
              title="Back to PCB Quality Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PCB</span>
            </button>
          </div>
        </div>

        {/* Page Banner Header */}
        <div className="bg-gradient-to-r from-[#0f2942] to-[#16395c] text-white rounded-2xl shadow-md border border-[#234b73] px-5 py-4 sm:px-6 sm:py-5 mx-[14px] sm:mx-[26px] mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/15">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white m-0">
                  {activePage === 'home'
                    ? 'Daily FQC Report'
                    : activePage === 'database'
                    ? 'All Database'
                    : `${PAGES[activePage].name} Entry`}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16a34a]/25 text-[#86efac] border border-[#16a34a]/40">
                  Live Production Entry
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#b9c9dc] mt-0.5 m-0">
                {activePage === 'visual'
                  ? 'PCB Visual Check (AOI Inspection)'
                  : activePage === 'aoi'
                  ? 'PCB AOI (Automatic Optical Inspection - Panel)'
                  : activePage === 'receive'
                  ? 'PCB Receive (IQC Incoming Quality Control)'
                  : activePage === 'delivery'
                  ? 'PCB Delivery (OQC Outgoing Quality Control)'
                  : activePage === 'database'
                  ? 'PCB Quality Management — All Saved Records'
                  : 'PCB — Visual Check · AOI · Receive · Delivery'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowManageModal(true)}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage Lists</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPage('database')}
              className="px-3.5 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>All Database</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-[14px] sm:px-[26px] sm:pt-[18px] sm:pb-[48px] flex-1">
          {/* ================= HOME PAGE ================= */}
          {activePage === 'home' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-4">
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center">
                  <div className="text-[26px] font-extrabold text-[#123a6b]">
                    {homeStats.totalRecords}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5">
                    Total Records
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center">
                  <div className="text-[26px] font-extrabold text-[#123a6b]">
                    {homeStats.todayRecords}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5">
                    Entries Today
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center">
                  <div className="text-[26px] font-extrabold text-[#123a6b]">
                    {homeStats.totalChecked}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5">
                    Units Checked (QC)
                  </div>
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-4 text-center">
                  <div className="text-[26px] font-extrabold text-[#123a6b]">
                    {homeStats.failRate}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-semibold mt-0.5">
                    Overall Fail Rate
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
                <header className="px-4 py-3 flex items-center gap-[9px] font-bold text-[14px] text-[#1c2733] border-b border-[#e2e8f0]">
                  Quick Entry
                </header>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SHEET_KEYS.map((k) => (
                      <div
                        key={k}
                        onClick={() => handleSelectPage(k)}
                        className="bg-white border border-[#e2e8f0] hover:border-[#1565c0] hover:shadow-[0_2px_10px_rgba(21,101,192,0.12)] rounded-[10px] px-4 py-[14px] cursor-pointer flex items-center gap-2.5 transition-all"
                      >
                        <div className="w-[34px] h-[34px] rounded-[8px] bg-[#eaf2fb] grid place-items-center shrink-0 text-[#123a6b]">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2l9 5-9 5-9-5 9-5z" />
                            <path d="M3 12l9 5 9-5" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-[12.5px] text-[#1c2733]">
                            {PAGES[k].name}
                          </div>
                          <div className="text-[11px] text-[#64748b]">
                            {store[k].length} records saved
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= DATABASE PAGE ================= */}
          {activePage === 'database' && (
            <div className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
              <header className="px-4 py-3 flex items-center gap-[9px] font-bold text-[14px] text-[#1c2733] border-b border-[#e2e8f0]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1565c0"
                  strokeWidth="2"
                >
                  <ellipse cx="12" cy="5" rx="8" ry="3" />
                  <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
                  <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
                </svg>
                <span>All Records</span>
              </header>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2.5 mb-[14px]">
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-auto min-w-[180px] text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                  >
                    <option value="">All Report Types</option>
                    {SHEET_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {PAGES[k].name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={dbSearch}
                    onChange={(e) => setDbSearch(e.target.value)}
                    placeholder="Search model..."
                    className="max-w-[220px] w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                  />
                  <span className="ml-auto text-[11.5px] text-[#64748b] font-semibold">
                    {filteredDbRows.length} {filteredDbRows.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12px] min-w-[620px]">
                    <thead>
                      <tr>
                        {[
                          'Type',
                          'Date',
                          'Model',
                          'Qty',
                          'Fail/Short+Open',
                          'Product',
                          'Layer / Material',
                        ].map((h) => (
                          <th
                            key={h}
                            className="bg-[#eaf2fb] text-[#123a6b] font-bold text-left px-[9px] py-[7px] border border-[#e2e8f0] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDbRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-[#64748b] p-4 text-center text-[12.5px] border border-[#e2e8f0]"
                          >
                            No matching records.
                          </td>
                        </tr>
                      ) : (
                        filteredDbRows.map((r, i) => (
                          <tr key={i}>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.type}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.date || '—'}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.model || '—'}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.qty}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.fail}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.product}
                            </td>
                            <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap">
                              {r.layerMat}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2.5 mt-[14px] flex-wrap items-center">
                  <button
                    type="button"
                    onClick={handleExportDatabase}
                    disabled={allDbRows.length === 0}
                    className="font-bold text-[12.5px] px-4 py-[9px] rounded-[7px] cursor-pointer border border-[#cbd5e1] bg-white text-[#1c2733] hover:border-[#1565c0] hover:text-[#1565c0] disabled:opacity-50"
                  >
                    Export All CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= ENTRY PAGES (Visual / AOI / Receive / Delivery) ================= */}
          {activePage !== 'home' &&
            activePage !== 'database' &&
            (() => {
              const sheet: SheetKey = activePage;
              const cfg = PAGES[sheet];
              const rows = store[sheet];

              return (
                <div>
                  {/* Entry Form Card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
                    <header className="px-4 py-3 flex items-center gap-[9px] font-bold text-[14px] text-[#1c2733] border-b border-[#e2e8f0]">
                      <span>New {cfg.name} Entry</span>
                      {cfg.hint && (
                        <span className="font-normal text-[11px] text-[#64748b] ml-auto">
                          {cfg.hint}
                        </span>
                      )}
                    </header>

                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-[14px]">
                        {/* Date */}
                        <div>
                          <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                            DATE
                          </label>
                          <input
                            type="date"
                            value={formValues['Date'] || ''}
                            onChange={(e) => updateField('Date', e.target.value, sheet)}
                            required
                            className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                          />
                        </div>

                        {/* Month (readonly auto) */}
                        <div>
                          <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                            MONTH
                          </label>
                          <input
                            type="text"
                            value={formValues['Month'] || ''}
                            readOnly
                            placeholder="auto"
                            className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                          />
                        </div>

                        {/* Model (span 2) */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                            MODEL
                          </label>
                          <input
                            type="text"
                            list="dl-models"
                            value={formValues['Model'] || ''}
                            onChange={(e) => updateField('Model', e.target.value, sheet)}
                            placeholder="Select / type model"
                            required
                            className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                          />
                        </div>

                        {/* Sheet-specific fields */}
                        {sheet === 'visual' && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                TOTAL CHECK
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Total Check'] || ''}
                                onChange={(e) => updateField('Total Check', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                FAIL QTY
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Fail QTY'] || ''}
                                onChange={(e) => updateField('Fail QTY', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PRODUCT
                              </label>
                              <input
                                type="text"
                                list="dl-products"
                                value={formValues['Product'] || ''}
                                onChange={(e) => updateField('Product', e.target.value, sheet)}
                                placeholder="External S"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                LAYER
                              </label>
                              <input
                                type="text"
                                list="dl-layers"
                                value={formValues['Layer'] || ''}
                                onChange={(e) => updateField('Layer', e.target.value, sheet)}
                                placeholder="Add Layer Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                          </>
                        )}

                        {sheet === 'aoi' && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PASS (PANEL)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Pass (Panel)'] || ''}
                                onChange={(e) => updateField('Pass (Panel)', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                SHORT
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Short'] || ''}
                                onChange={(e) => updateField('Short', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                OPEN
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formValues['Open'] || ''}
                                onChange={(e) => updateField('Open', e.target.value, sheet)}
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                FAIL (PANEL)
                              </label>
                              <input
                                type="number"
                                value={formValues['Fail (Panel)'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                TOTAL CHECK (PANEL)
                              </label>
                              <input
                                type="number"
                                value={formValues['Total Check (Panel)'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PASS RATIO
                              </label>
                              <input
                                type="text"
                                value={formValues['Pass Ratio'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                FAIL RATIO
                              </label>
                              <input
                                type="text"
                                value={formValues['Fail Ratio'] || ''}
                                readOnly
                                className="w-full text-[13px] bg-[#eaf2fb] text-[#123a6b] font-bold border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PRODUCT
                              </label>
                              <input
                                type="text"
                                list="dl-products"
                                value={formValues['Product'] || ''}
                                onChange={(e) => updateField('Product', e.target.value, sheet)}
                                placeholder="External S"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                LAYER
                              </label>
                              <input
                                type="text"
                                list="dl-layers"
                                value={formValues['Layer'] || ''}
                                onChange={(e) => updateField('Layer', e.target.value, sheet)}
                                placeholder="Add Layer Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                          </>
                        )}

                        {(sheet === 'receive' || sheet === 'delivery') && (
                          <>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                {sheet === 'receive' ? 'RECEIVE QTY' : 'DELIVERY QTY'}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  formValues[
                                    sheet === 'receive' ? 'Receive QTY' : 'Delivery QTY'
                                  ] || ''
                                }
                                onChange={(e) =>
                                  updateField(
                                    sheet === 'receive' ? 'Receive QTY' : 'Delivery QTY',
                                    e.target.value,
                                    sheet
                                  )
                                }
                                placeholder="0"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                PRODUCT
                              </label>
                              <input
                                type="text"
                                list="dl-products"
                                value={formValues['Product'] || ''}
                                onChange={(e) => updateField('Product', e.target.value, sheet)}
                                placeholder="External S"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                LAYER
                              </label>
                              <input
                                type="text"
                                list="dl-layers"
                                value={formValues['Layer'] || ''}
                                onChange={(e) => updateField('Layer', e.target.value, sheet)}
                                placeholder="Add Layer Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10.5px] font-bold tracking-[0.4px] text-[#64748b] mb-1.5 uppercase">
                                MATERIAL
                              </label>
                              <input
                                type="text"
                                list="dl-materials"
                                value={formValues['Material'] || ''}
                                onChange={(e) => updateField('Material', e.target.value, sheet)}
                                placeholder="Add Material Please......"
                                className="w-full text-[13px] text-[#1c2733] bg-white border border-[#cbd5e1] rounded-[7px] px-2.5 py-[9px] outline-none focus:ring-2 focus:ring-[#1565c0]"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2.5 mt-[14px] flex-wrap items-center">
                        <button
                          type="button"
                          onClick={() => handleAddEntry(sheet)}
                          className="font-bold text-[12.5px] px-4 py-[9px] rounded-[7px] cursor-pointer border border-[#123a6b] bg-[#123a6b] text-white hover:bg-[#1565c0] hover:border-[#1565c0] transition-colors"
                        >
                          + Add Entry
                        </button>
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="font-bold text-[12.5px] px-4 py-[9px] rounded-[7px] cursor-pointer border border-[#cbd5e1] bg-transparent text-[#1c2733] hover:border-[#1565c0] hover:text-[#1565c0] transition-colors"
                        >
                          Clear Fields
                        </button>
                        {formError && (
                          <span className="text-[#e2231a] text-[11.5px] font-bold">
                            Please fill the required fields.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Today's Log Card */}
                  <section className="bg-white border border-[#e2e8f0] rounded-[10px] mb-4 overflow-hidden">
                    <header className="px-4 py-3 flex items-center justify-between gap-2.5 flex-wrap font-bold text-[14px] text-[#1c2733]">
                      <span>Today&apos;s {cfg.name} Log</span>
                      <span className="text-[11.5px] text-[#64748b] font-semibold">
                        {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </header>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12px] min-w-[620px]">
                        <thead>
                          <tr>
                            {cfg.cols.map((c) => (
                              <th
                                key={c}
                                className="bg-[#eaf2fb] text-[#123a6b] font-bold text-left px-[9px] py-[7px] border border-[#e2e8f0] whitespace-nowrap"
                              >
                                {c}
                              </th>
                            ))}
                            <th className="bg-[#eaf2fb] text-[#123a6b] font-bold text-left px-[9px] py-[7px] border border-[#e2e8f0] whitespace-nowrap" />
                          </tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={cfg.cols.length + 1}
                                className="text-[#64748b] p-4 text-center text-[12.5px] border border-[#e2e8f0]"
                              >
                                No entries yet — add one above.
                              </td>
                            </tr>
                          ) : (
                            rows.map((r, i) => {
                              const fk =
                                sheet === 'visual'
                                  ? 'Fail QTY'
                                  : sheet === 'aoi'
                                  ? 'Fail (Panel)'
                                  : '';
                              const hasFail = fk ? num(r[fk]) > 0 : false;
                              return (
                                <tr key={i}>
                                  {cfg.cols.map((c) => {
                                    const isFailCell = c === 'Fail QTY' || c === 'Fail (Panel)';
                                    const cellColor = isFailCell
                                      ? hasFail
                                        ? 'text-[#e2231a] font-bold'
                                        : 'text-[#1e9e6b] font-bold'
                                      : '';
                                    return (
                                      <td
                                        key={c}
                                        className={`px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap ${cellColor}`}
                                      >
                                        {r[c] !== undefined && r[c] !== '' ? String(r[c]) : '—'}
                                      </td>
                                    );
                                  })}
                                  <td className="px-[9px] py-[6px] border border-[#e2e8f0] whitespace-nowrap text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRow(sheet, i)}
                                      className="border-none bg-transparent text-[#e2231a] cursor-pointer text-[14px] font-bold px-1 hover:underline"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Strip */}
                    {rows.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-[14px] py-3 bg-[#eaf2fb] border-t border-[#e2e8f0]">
                        {sheet === 'visual' &&
                          (() => {
                            let tot = 0,
                              pass = 0,
                              fail = 0;
                            rows.forEach((r) => {
                              tot += num(r['Total Check']);
                              pass += num(r['Pass QTY']);
                              fail += num(r['Fail QTY']);
                            });
                            return (
                              <>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {tot}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Total Checked
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {pass}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Total Pass
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {fail}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Total Fail
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {pct(fail, tot)}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Fail Rate
                                  </div>
                                </div>
                              </>
                            );
                          })()}

                        {sheet === 'aoi' &&
                          (() => {
                            let pass = 0,
                              fail = 0,
                              total = 0;
                            rows.forEach((r) => {
                              pass += num(r['Pass (Panel)']);
                              fail += num(r['Fail (Panel)']);
                              total += num(r['Total Check (Panel)']);
                            });
                            return (
                              <>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {total}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Total Panels
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {pass}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Total Pass
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {fail}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Total Fail
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {pct(fail, total)}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Fail Rate
                                  </div>
                                </div>
                              </>
                            );
                          })()}

                        {(sheet === 'receive' || sheet === 'delivery') &&
                          (() => {
                            const key = sheet === 'receive' ? 'Receive QTY' : 'Delivery QTY';
                            let q = 0;
                            rows.forEach((r) => {
                              q += num(r[key]);
                            });
                            const modelsCount = new Set(rows.map((r) => r.Model)).size;
                            return (
                              <>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {rows.length}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Entries
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {q}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    {sheet === 'receive'
                                      ? 'Total Receive QTY'
                                      : 'Total Delivery QTY'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[21px] font-extrabold text-[#123a6b]">
                                    {modelsCount}
                                  </div>
                                  <div className="text-[10.5px] text-[#64748b] font-semibold uppercase tracking-[0.3px]">
                                    Models
                                  </div>
                                </div>
                                <div className="text-center" />
                              </>
                            );
                          })()}
                      </div>
                    )}
                  </section>

                  {/* Datalists driven by Manage Master Lists */}
                  <datalist id="dl-models">
                    {masterLists.models.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  <datalist id="dl-products">
                    {masterLists.products.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  <datalist id="dl-layers">
                    {masterLists.layers.map((l) => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                  <datalist id="dl-materials">
                    {masterLists.materials.map((mat) => (
                      <option key={mat} value={mat} />
                    ))}
                  </datalist>
                </div>
              );
            })()}
        </main>
      </div>

      {/* MANAGE LISTS MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Settings className="w-4 h-4 text-[#60a5fa]" />
                <span>Manage Master Lists (PCB)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#e2e8f0] bg-[#fafbfc]">
              {(
                [
                  { id: 'models', label: `Models (${masterLists.models.length})` },
                  { id: 'products', label: `Products (${masterLists.products.length})` },
                  { id: 'layers', label: `Layers (${masterLists.layers.length})` },
                  { id: 'materials', label: `Materials (${masterLists.materials.length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveModalTab(tab.id);
                    setNewListItemInput('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeModalTab === tab.id
                      ? 'border-[#2563eb] text-[#2563eb] bg-white'
                      : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListItemInput}
                  onChange={(e) => setNewListItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddListItem();
                    }
                  }}
                  placeholder={`Add new ${activeModalTab.slice(0, -1)}...`}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#cbd5e1] focus:border-[#2563eb] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddListItem}
                  className="px-4 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {masterLists[activeModalTab].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#1e293b]"
                  >
                    <span className="truncate pr-2">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem(activeModalTab, item)}
                      className="text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-5 py-2 bg-[#0f2942] hover:bg-[#16395c] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
