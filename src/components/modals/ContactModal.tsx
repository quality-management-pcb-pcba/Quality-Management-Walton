import React, { useState } from 'react';
import { X, Mail, Phone, Globe, MapPin, Copy, Check, ExternalLink } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contactDetails = [
    {
      id: 'contact-email',
      key: 'email',
      label: 'Email Id',
      value: 'qm.pcb26@gmail.com',
      actionUrl: 'mailto:qm.pcb26@gmail.com',
      actionType: 'email',
      icon: Mail,
      iconColor: 'text-[#e35b2a]',
      iconBg: 'bg-[#e35b2a]/10',
    },
    {
      id: 'contact-phone',
      key: 'phone',
      label: 'Mobile Number',
      value: '+880 1678-860873',
      subValue: 'Direct Quality Line / Helpline',
      actionUrl: 'tel:+8801678860873',
      actionType: 'phone',
      icon: Phone,
      iconColor: 'text-[#128f83]',
      iconBg: 'bg-[#128f83]/10',
    },
    {
      id: 'contact-website',
      key: 'website',
      label: 'Web Address',
      value: 'www.waltonbd.com',
      actionUrl: 'https://www.waltonbd.com',
      actionType: 'link',
      icon: Globe,
      iconColor: 'text-[#22376b]',
      iconBg: 'bg-[#22376b]/10',
    },
    {
      id: 'contact-address',
      key: 'address',
      label: 'Address',
      value: 'Walton Hi-Tech Industries PLC, Chandra, Kaliakair, Gazipur - 1751, Bangladesh',
      subValue: 'Quality Management Division · PCB & PCBA Operations',
      actionUrl: 'https://maps.google.com/?q=Walton+Hi-Tech+Industries+PLC+Chandra+Gazipur',
      actionType: 'map',
      icon: MapPin,
      iconColor: 'text-[#d64545]',
      iconBg: 'bg-[#d64545]/10',
    },
  ];

  return (
    <div
      id="contact-us-modal-overlay"
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="contact-us-modal-card"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e7f2] relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="btn-close-contact-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#5b6480] hover:bg-[#eef1f8] hover:text-[#0d1730] transition-colors cursor-pointer"
          aria-label="Close Contact Us dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#0d1730] text-[#e35b2a] border border-[#22376b] flex items-center justify-center shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0d1730]">Contact Us</h3>
            <p className="text-xs text-[#5b6480]">Quality Management · Walton Hi-Tech Industries PLC</p>
          </div>
        </div>

        {/* Contact Details List */}
        <div className="space-y-3">
          {contactDetails.map((item) => {
            const Icon = item.icon;
            const isCopied = copiedKey === item.key;

            return (
              <div
                key={item.key}
                id={item.id}
                className="p-3.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition-all duration-150 flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block mb-0.5">
                      {item.label}
                    </span>
                    {item.actionType === 'email' ? (
                      <a
                        href={item.actionUrl}
                        className="text-[13px] font-semibold text-[#0f172a] hover:text-[#e35b2a] hover:underline break-all block"
                      >
                        {item.value}
                      </a>
                    ) : item.actionType === 'phone' ? (
                      <a
                        href={item.actionUrl}
                        className="text-[13px] font-semibold text-[#0f172a] hover:text-[#128f83] hover:underline block"
                      >
                        {item.value}
                      </a>
                    ) : item.actionType === 'link' ? (
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] font-semibold text-[#0f172a] hover:text-[#22376b] hover:underline inline-flex items-center gap-1.5 break-all"
                      >
                        <span>{item.value}</span>
                        <ExternalLink className="w-3 h-3 text-[#64748b] shrink-0" />
                      </a>
                    ) : (
                      <div className="text-[13px] font-medium text-[#0f172a] leading-snug">
                        {item.value}
                      </div>
                    )}

                    {item.subValue && (
                      <p className="text-[11px] text-[#64748b] mt-0.5 leading-relaxed">
                        {item.subValue}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick copy button */}
                <button
                  type="button"
                  onClick={() => handleCopy(item.key, item.value)}
                  className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-white border border-transparent hover:border-[#cbd5e1] transition-colors shrink-0 cursor-pointer"
                  title={`Copy ${item.label}`}
                  aria-label={`Copy ${item.label}`}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-[#16a34a]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
          <span>Office Hours: 08:00 AM – 05:00 PM (BST)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0d1730] hover:bg-[#1e293b] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
