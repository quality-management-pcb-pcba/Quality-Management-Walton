import React from 'react';
import { NonConformanceItem, CapaItem } from '../../types';
import { X, ShieldAlert, CheckCircle2, Calendar, User, CheckSquare } from 'lucide-react';

interface ItemDetailModalProps {
  ncItem?: NonConformanceItem | null;
  capaItem?: CapaItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  ncItem,
  capaItem,
  onClose,
}) => {
  if (!ncItem && !capaItem) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e7f2] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e7f2] mb-4">
          <div className="flex items-center gap-2">
            {ncItem ? (
              <>
                <ShieldAlert className="w-5 h-5 text-[#d64545]" />
                <h3 className="font-bold text-base text-[#0d1730]">NCR Record: {ncItem.code}</h3>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#e35b2a]" />
                <h3 className="font-bold text-base text-[#0d1730]">CAPA 8D Record: {capaItem?.code}</h3>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#5b6480] hover:bg-[#eef1f8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {ncItem && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#8891a8] uppercase">Defect Summary</span>
              <h4 className="text-sm font-bold text-[#0d1730] mt-0.5">{ncItem.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#eef1f8] rounded-xl">
              <div>
                <span className="text-[#5b6480]">Severity:</span>{' '}
                <span className="font-bold text-[#d64545]">{ncItem.classification}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Current Status:</span>{' '}
                <span className="font-bold text-[#0d1730]">{ncItem.status}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Line / Station:</span>{' '}
                <span className="font-semibold text-[#0d1730]">{ncItem.line}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Product:</span>{' '}
                <span className="font-semibold text-[#0d1730]">{ncItem.product}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Qty Quarantined:</span>{' '}
                <span className="font-mono font-bold text-[#0d1730]">{ncItem.quantityAffected} pcs</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Reported By:</span>{' '}
                <span className="font-medium text-[#0d1730]">{ncItem.reportedBy}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#5b6480] uppercase block mb-1">Description</span>
              <p className="p-3 bg-white border border-[#e2e7f2] rounded-lg text-xs leading-relaxed text-[#0d1730]">
                {ncItem.description}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#1c8a53] uppercase block mb-1">Containment &amp; Disposition</span>
              <p className="p-3 bg-[#e5f7ee] border border-[#1c8a53]/20 rounded-lg text-xs leading-relaxed text-[#1c8a53]">
                {ncItem.containmentAction}
              </p>
            </div>
          </div>
        )}

        {capaItem && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#8891a8] uppercase">CAPA Objective</span>
              <h4 className="text-sm font-bold text-[#0d1730] mt-0.5">{capaItem.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#eef1f8] rounded-xl">
              <div>
                <span className="text-[#5b6480]">Priority:</span>{' '}
                <span className="font-bold text-[#e35b2a]">{capaItem.priority}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Status:</span>{' '}
                <span className="font-bold text-[#0d1730]">{capaItem.status}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Source Trigger:</span>{' '}
                <span className="font-semibold text-[#0d1730]">{capaItem.source}</span>
              </div>
              <div>
                <span className="text-[#5b6480]">Target Due Date:</span>{' '}
                <span className="font-mono font-bold text-[#0d1730]">{capaItem.dueDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#5b6480]">Lead Engineer:</span>{' '}
                <span className="font-medium text-[#0d1730]">{capaItem.owner}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#5b6480] uppercase block mb-1">Root Cause (Why Analysis)</span>
              <p className="p-3 bg-white border border-[#e2e7f2] rounded-lg text-xs leading-relaxed text-[#0d1730]">
                {capaItem.rootCause}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#22376b] uppercase block mb-1">8D Corrective Action Plan</span>
              <p className="p-3 bg-[#eef1f8] border border-[#2a3c6b]/20 rounded-lg text-xs leading-relaxed text-[#22376b]">
                {capaItem.actionPlan}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="font-semibold text-[#5b6480]">Implementation Progress</span>
                <span className="font-mono font-bold">{capaItem.progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#e2e7f2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1fb6a6] rounded-full transition-all"
                  style={{ width: `${capaItem.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-[#e2e7f2] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#182a52] hover:bg-[#22376b] text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
