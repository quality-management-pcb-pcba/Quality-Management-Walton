import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  Globe,
  ExternalLink,
  Factory,
  Target,
  Eye,
  Briefcase,
  PlayCircle,
  Mail,
  Users,
  Video as VideoIcon,
  Sparkles,
} from 'lucide-react';
import { WaltonSealLogo } from '../WaltonSealLogo';

export type AboutTabType = 'mission' | 'vision' | 'overview' | 'career' | 'video';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AboutTabType;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<AboutTabType>(initialTab);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsPlayingVideo(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      id="about-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="about-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#cbd5e1] animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0d1730] px-5 sm:px-6 py-3.5 flex items-center justify-between border-b-[3px] border-[#e35b2a] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-1 shrink-0 border border-white/20">
              <WaltonSealLogo className="w-full h-full" animated={false} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                About Walton Quality Management
              </h2>
              <p className="text-xs text-[#93c5fd] font-medium">
                PCB &amp; PCBA Manufacturing Division · Walton Hi-Tech Industries PLC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close About Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-menu Navigation Tabs Bar */}
        <div
          id="about-modal-sub-menu-tabs"
          className="bg-[#f8fafc] border-b border-[#e2e8f0] px-4 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none"
        >
          <button
            onClick={() => {
              setActiveTab('mission');
              setIsPlayingVideo(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'mission'
                ? 'bg-[#1c356b] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-200/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#e35b2a]" />
            <span>Mission</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vision');
              setIsPlayingVideo(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'vision'
                ? 'bg-[#1c356b] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-200/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Vision</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('overview');
              setIsPlayingVideo(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1c356b] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#2dd4bf]" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('career');
              setIsPlayingVideo(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'career'
                ? 'bg-[#1c356b] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Career</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-[#1c356b] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-200/60'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#f43f5e]" />
            <span>Video</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-[#334155] leading-relaxed flex-1">
          {/* TAB 1: MISSION */}
          {activeTab === 'mission' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/70 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[#9a3412] font-bold text-base mb-2">
                  <Target className="w-5 h-5 text-[#e35b2a]" />
                  <h3>Our Quality Mission</h3>
                </div>
                <p className="text-sm text-[#431407] font-medium leading-relaxed">
                  "To achieve global quality excellence in PCB &amp; PCBA manufacturing through relentless adherence to Zero-Defect
                  disciplines, precision IPC-A-610 standards, and automated in-line intelligence—delivering 100% reliable electronics
                  that inspire worldwide trust in Walton."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#e35b2a] flex items-center justify-center font-bold text-xs mb-2">
                    01
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0d1730]">Zero Defect Delivery</h4>
                  <p className="text-xs text-[#64748b] mt-1">
                    Systematic root-cause containment using 8D CAPA, Poka-Yoke fixtures, and SPI/AOI optical checkpoints.
                  </p>
                </div>

                <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0047ba] flex items-center justify-center font-bold text-xs mb-2">
                    02
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0d1730]">IPC Class 2 &amp; 3</h4>
                  <p className="text-xs text-[#64748b] mt-1">
                    Rigorous compliance with international solder acceptability, barrel fill, and IPC-6012 board integrity.
                  </p>
                </div>

                <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0d9488] flex items-center justify-center font-bold text-xs mb-2">
                    03
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0d1730]">Employee Empowerment</h4>
                  <p className="text-xs text-[#64748b] mt-1">
                    Continuous technical training, ESD certification, and monthly Worker Talent recognition programs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISION */}
          {activeTab === 'vision' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[#1e3a8a] font-bold text-base mb-2">
                  <Eye className="w-5 h-5 text-[#2563eb]" />
                  <h3>Our Strategic Vision</h3>
                </div>
                <p className="text-sm text-[#172554] font-medium leading-relaxed">
                  "To be recognised as South Asia's foremost high-density electronics manufacturing hub, pioneering smart Industry 4.0
                  smart factories, automated AI defect classification, and sustainable green electronics for global export."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10 text-[#2563eb] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0d1730]">Industry 4.0 Smart QMS</h4>
                    <p className="text-xs text-[#64748b] mt-1">
                      Integrating IoT sensor telemetry, real-time reflow oven profiling, and automated yield tracking into cloud intelligence.
                    </p>
                  </div>
                </div>

                <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#14b8a6]/10 text-[#14b8a6] shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0d1730]">Global Export Standard</h4>
                    <p className="text-xs text-[#64748b] mt-1">
                      Expanding Walton PCB &amp; PCBA presence across European, Middle Eastern, and Asian international OEM markets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[#0d1730] font-bold text-base mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#14b8a6]" />
                  <h3>Zero-Defect Manufacturing Infrastructure</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#475569]">
                  Walton Quality Management operates with an uncompromising commitment to Total Quality Management (TQM).
                  From raw laminate copper clad verification to high-speed surface-mount technology (SMT) and automated optical
                  inspection (AOI), our continuous inspection pipeline ensures precision and industrial-grade reliability.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#0d1730] text-xs sm:text-sm uppercase tracking-wider mb-3">
                  Quality Assurance Infrastructure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-[#e2e8f0] rounded-xl p-3.5 flex items-start gap-3 bg-white hover:border-[#93c5fd] transition-colors">
                    <div className="p-2 rounded-lg bg-[#0047ba]/10 text-[#0047ba] shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#0d1730]">High-Speed SMT &amp; Testing</h5>
                      <p className="text-[11px] sm:text-xs text-[#64748b] mt-0.5">
                        Advanced solder paste inspection (SPI), automated pick-and-place, reflow profiling, and in-circuit testing (ICT).
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-xl p-3.5 flex items-start gap-3 bg-white hover:border-[#93c5fd] transition-colors">
                    <div className="p-2 rounded-lg bg-[#14b8a6]/10 text-[#14b8a6] shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#0d1730]">IPC-A-610 Compliance</h5>
                      <p className="text-[11px] sm:text-xs text-[#64748b] mt-0.5">
                        Class 2 and Class 3 electronics acceptability standards enforced through automated visual and X-ray analysis.
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-xl p-3.5 flex items-start gap-3 bg-white hover:border-[#93c5fd] transition-colors">
                    <div className="p-2 rounded-lg bg-[#e35b2a]/10 text-[#e35b2a] shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#0d1730]">ISO 9001:2015 Certified</h5>
                      <p className="text-[11px] sm:text-xs text-[#64748b] mt-0.5">
                        Strict adherence to global quality management systems, 8D CAPA resolution, and statistical process control (SPC).
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-xl p-3.5 flex items-start gap-3 bg-white hover:border-[#93c5fd] transition-colors">
                    <div className="p-2 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] shrink-0">
                      <Factory className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#0d1730]">State-of-the-Art Plant</h5>
                      <p className="text-[11px] sm:text-xs text-[#64748b] mt-0.5">
                        Located in Walton Hi-Tech Park, Chandra, Gazipur — powering South Asia's premier electronics manufacturing hub.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAREER */}
          {activeTab === 'career' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-[#065f46] font-bold text-base mb-2">
                  <Briefcase className="w-5 h-5 text-[#059669]" />
                  <h3>Careers in Walton Quality Management</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#064e3b] font-medium leading-relaxed">
                  Join South Asia's leading electronics manufacturing team. We are continually looking for passionate quality engineers,
                  SMT line leaders, process capability specialists, and laboratory research analysts.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-[#0d1730] uppercase tracking-wider">
                  Open Positions in PCB &amp; PCBA Quality Division
                </h4>

                <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white hover:border-[#059669] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h5 className="font-bold text-sm text-[#0d1730]">Senior QA Engineer (SMT &amp; Reflow)</h5>
                    <p className="text-xs text-[#64748b] mt-0.5">Department: Quality Assurance · Location: Walton Hi-Tech Park, Gazipur</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10.5px] font-semibold">IPC-A-610 Certified</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold">Full Time</span>
                    </div>
                  </div>
                  <a
                    href="mailto:qm.pcba26@gmail.com?subject=Application%20for%20Senior%20QA%20Engineer"
                    className="px-3.5 py-1.5 bg-[#1c356b] hover:bg-[#254487] text-white text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Apply Now</span>
                  </a>
                </div>

                <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white hover:border-[#059669] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h5 className="font-bold text-sm text-[#0d1730]">Quality Control Inspector (AOI &amp; Testing)</h5>
                    <p className="text-xs text-[#64748b] mt-0.5">Department: Quality Control · Location: Chandra, Kaliakair</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10.5px] font-semibold">AOI/SPI Experience</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold">Full Time</span>
                    </div>
                  </div>
                  <a
                    href="mailto:qm.pcba26@gmail.com?subject=Application%20for%20QC%20Inspector"
                    className="px-3.5 py-1.5 bg-[#1c356b] hover:bg-[#254487] text-white text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Apply Now</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VIDEO */}
          {activeTab === 'video' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border border-[#cbd5e1] rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                {isPlayingVideo ? (
                  <div className="aspect-video w-full">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                      title="Walton PCB & PCBA Smart Factory Tour"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-linear-to-br from-slate-900 via-[#0d1730] to-slate-950 flex flex-col items-center justify-center text-center p-6 group cursor-pointer"
                    onClick={() => setIsPlayingVideo(true)}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e35b2a] group-hover:scale-110 group-hover:bg-[#c74a1f] text-white flex items-center justify-center shadow-xl transition-transform duration-200 mb-4">
                      <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 fill-white text-[#e35b2a]" />
                    </div>
                    <h4 className="text-white font-bold text-base sm:text-lg">
                      Walton High-Tech Park PCB &amp; PCBA Facility Tour
                    </h4>
                    <p className="text-xs sm:text-sm text-[#93c5fd] mt-1 max-w-md">
                      Watch automated SMT lines, robotic pick-and-place, optical AOI inspection, and cleanroom quality workflows in action.
                    </p>
                    <span className="mt-3 px-3 py-1 bg-white/10 text-white/90 text-xs rounded-full border border-white/20">
                      Click to Play Factory Video
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748b] px-1">
                <span>Official Walton Hi-Tech Industries PLC Media Documentation</span>
                <a
                  href="https://www.youtube.com/@WaltonBD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0047ba] hover:underline flex items-center gap-1 font-semibold"
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>More Videos on Walton YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-[#f8fafc] px-5 sm:px-6 py-3.5 border-t border-[#e2e8f0] flex items-center justify-between">
          <a
            href="https://waltonbd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0047ba] hover:underline flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Visit Corporate Website</span>
            <ExternalLink className="w-3 h-3" />
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
