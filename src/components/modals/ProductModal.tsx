import React, { useState } from 'react';
import { X, Cpu, CheckCircle2, ChevronRight, Zap, Layers, Tv, Wind, Refrigerator, Smartphone, ExternalLink } from 'lucide-react';
import { PageId } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageId) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<'all' | 'pcba' | 'pcb'>('all');

  const products = [
    {
      id: 'charger',
      name: 'Mobile Phone Fast Chargers',
      category: 'pcba',
      model: 'CHG-PD-30W / CHG-QC-18W',
      icon: Smartphone,
      accent: 'text-[#e35b2a] bg-[#e35b2a]/10',
      description: 'High-density switched-mode power supplies (SMPS) with Type-C Power Delivery, surge protection, and low ripple.',
      standards: ['IPC-A-610 Class 2', 'Thermal Runaway Safe', '100% Full Load Burn-in'],
      jumpPage: 'pcba' as PageId,
    },
    {
      id: 'fridge',
      name: 'Inverter Refrigerator Controller',
      category: 'pcba',
      model: 'WFB-INV-MAIN / WFB-DISP-01',
      icon: Refrigerator,
      accent: 'text-[#0047ba] bg-[#0047ba]/10',
      description: 'Brushless DC motor inverter driver board featuring energy-saving vector algorithm, humidity resistance, and conformal coating.',
      standards: ['Anti-Vibration Rated', 'Conformal Coated', 'Automated Optical Inspected'],
      jumpPage: 'pcba' as PageId,
    },
    {
      id: 'ac',
      name: 'Inverter Air Conditioner Motherboard',
      category: 'pcba',
      model: 'WAC-INV-INDOOR / WAC-PWR-OUTDOOR',
      icon: Wind,
      accent: 'text-[#14b8a6] bg-[#14b8a6]/10',
      description: 'Dual MCU dual-loop control PCBA with intelligent defrost logic, active PFC (Power Factor Correction), and high thermal tolerance.',
      standards: ['PFC Standard 0.99', 'High Surge Protection', 'ICT & FCT 100% Tested'],
      jumpPage: 'pcba' as PageId,
    },
    {
      id: 'tv',
      name: 'Smart Android TV Mainboard & PSU',
      category: 'pcba',
      model: 'WTV-4K-SMART / WTV-LED-PWR',
      icon: Tv,
      accent: 'text-[#7c3aed] bg-[#7c3aed]/10',
      description: 'Ultra-fast multi-core media processor PCB assembly with high-speed DDR traces, HDMI 2.1 lanes, and integrated LED driver.',
      standards: ['Impedance Controlled', 'X-Ray BGA Verified', 'EMI/EMC Compliant'],
      jumpPage: 'pcba' as PageId,
    },
    {
      id: 'pcb-multilayer',
      name: 'Multi-Layer High Density FR4 PCB',
      category: 'pcb',
      model: '4-Layer & 6-Layer FR4 TG150/170',
      icon: Layers,
      accent: 'text-[#0d9488] bg-[#0d9488]/10',
      description: 'Precision copper-clad laminated printed circuit boards with fine-pitch microvias, ENIG/HASL surface finishes, and high thermal glass transition.',
      standards: ['IPC-6012 Class 2', 'Flying Probe Tested', 'RoHS & REACH Compliant'],
      jumpPage: 'pcb-process' as PageId,
    },
    {
      id: 'pcb-doublesided',
      name: 'Double-Sided Power & Inverter PCB',
      category: 'pcb',
      model: '2-Layer 2oz/3oz Thick Copper PCB',
      icon: Zap,
      accent: 'text-[#d97706] bg-[#d97706]/10',
      description: 'Heavy copper boards engineered for high current pathways, heat dissipation relief, and long-term durability in home appliances.',
      standards: ['100% E-Tested', 'High Voltage Proof', 'UL 94V-0 Flame Retardant'],
      jumpPage: 'pcb-process' as PageId,
    },
  ];

  const filteredProducts = products.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#cbd5e1] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0d1730] px-5 sm:px-6 py-4 flex items-center justify-between border-b-[3px] border-[#e35b2a] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#14b8a6]/20 flex items-center justify-center p-2 shrink-0 border border-[#14b8a6]/40 text-[#2dd4bf]">
              <Cpu className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Walton PCB &amp; PCBA Products
              </h2>
              <p className="text-xs text-[#93c5fd] font-medium">
                High-Reliability Electronics Manufacturing Showcase &amp; Line Inspection Portals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Product Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter categories bar */}
        <div className="px-5 sm:px-6 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#1c356b] text-white shadow-xs'
                  : 'bg-white text-[#475569] border border-[#cbd5e1] hover:bg-slate-100'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveCategory('pcba')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === 'pcba'
                  ? 'bg-[#1c356b] text-white shadow-xs'
                  : 'bg-white text-[#475569] border border-[#cbd5e1] hover:bg-slate-100'
              }`}
            >
              PCBA Modules (4)
            </button>
            <button
              onClick={() => setActiveCategory('pcb')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === 'pcb'
                  ? 'bg-[#1c356b] text-white shadow-xs'
                  : 'bg-white text-[#475569] border border-[#cbd5e1] hover:bg-slate-100'
              }`}
            >
              Bare PCB (2)
            </button>
          </div>
          <span className="text-[11px] text-[#64748b] hidden sm:inline">
            100% Verified by Quality Assurance
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredProducts.map((p) => {
              const IconComp = p.icon;
              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#cbd5e1] rounded-xl p-4 shadow-xs hover:border-[#14b8a6] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${p.accent}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0d1730] leading-tight">
                            {p.name}
                          </h4>
                          <span className="text-[10.5px] font-mono font-semibold text-[#0047ba] bg-blue-50 px-1.5 py-0.5 rounded-sm">
                            {p.model}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed mb-3">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.standards.map((std, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#f1f5f9] text-[#334155] px-2 py-0.5 rounded-md"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#14b8a6]" />
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate(p.jumpPage);
                      }}
                      className="w-full mt-1 py-1.5 px-3 bg-[#f8fafc] hover:bg-[#1c356b] hover:text-white text-[#1c356b] border border-[#cbd5e1] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Quality Inspection Line</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#f8fafc] px-5 sm:px-6 py-3.5 border-t border-[#e2e8f0] flex items-center justify-between">
          <a
            href="https://waltonbd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0047ba] hover:underline flex items-center gap-1"
          >
            <span>Explore Walton Consumer Products at waltonbd.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1c356b] hover:bg-[#254487] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
