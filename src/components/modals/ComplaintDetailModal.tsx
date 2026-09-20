import React from 'react';
import { CustomerComplaint } from '../../types';
import {
  X,
  MessageSquareWarning,
  Printer,
  Calendar,
  User,
  Package,
  Layers,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: CustomerComplaint | null;
  onClose: () => void;
  onEdit?: (item: CustomerComplaint) => void;
  onNavigateToRca?: (complaint: CustomerComplaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onEdit,
  onNavigateToRca,
}) => {
  if (!complaint) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusBadgeColor =
    complaint.status === 'Closed' || complaint.status === 'Resolved'
      ? 'bg-[#e5f7ee] text-[#1c8a53] border-[#a1e5c0]'
      : complaint.status === 'Open'
      ? 'bg-[#fdece5] text-[#d64545] border-[#f8c1b0]'
      : 'bg-[#fef6e7] text-[#b45309] border-[#fcd38d]';

  const severityBadgeColor =
    complaint.severity === 'Critical'
      ? 'bg-[#d64545] text-white'
      : complaint.severity === 'Major'
      ? 'bg-[#e35b2a] text-white'
      : 'bg-[#e8a13a] text-white';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 print:bg-white print:p-0 print:static">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-6 p-5 sm:p-6 shadow-2xl border border-[#e2e7f2] max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e2e7f2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#fdece5] text-[#e35b2a] print:hidden">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#122040] text-white">
                  {complaint.ticketNo}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
                  {complaint.status}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityBadgeColor}`}>
                  {complaint.severity} Defect
                </span>
                <span className="text-[11px] font-mono text-[#5b6480]">{complaint.accountTier}</span>
              </div>
              <h3 className="font-bold text-lg text-[#0d1730] mt-1">{complaint.customerName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(complaint);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-[#424e6b] hover:bg-[#eef1f8] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Edit Record"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-[#424e6b] hover:bg-[#eef1f8] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5b6480] hover:bg-[#eef1f8] hover:text-[#0d1730] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 pt-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e7f2]">
            <div>
              <div className="text-[10.5px] font-semibold text-[#5b6480] uppercase">Product Model</div>
              <div className="font-mono font-bold text-sm text-[#0d1730] mt-0.5">{complaint.modelNo}</div>
              <div className="text-[10px] text-[#8891a8] mt-0.5">Category: {complaint.productCategory}</div>
            </div>

            <div>
              <div className="text-[10.5px] font-semibold text-[#5b6480] uppercase">Lot / Batch No</div>
              <div className="font-mono font-bold text-sm text-[#0d1730] mt-0.5">{complaint.lotBatchNo}</div>
              <div className="text-[10px] text-[#8891a8] mt-0.5">Received: {complaint.receivedDate}</div>
            </div>

            <div>
              <div className="text-[10.5px] font-semibold text-[#5b6480] uppercase">Quantities &amp; Rate</div>
              <div className="font-mono font-bold text-sm text-[#d64545] mt-0.5">
                {complaint.defectQty} / {complaint.deliveryQty.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#5b6480] mt-0.5">
                Failure: <span className="font-bold font-mono text-[#e35b2a]">{complaint.defectRate}%</span>
              </div>
            </div>

            <div>
              <div className="text-[10.5px] font-semibold text-[#5b6480] uppercase">NPS Feedback Rating</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-lg text-[#0d1730]">{complaint.npsScore}/10</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    complaint.npsCategory === 'Promoter'
                      ? 'bg-[#e5f7ee] text-[#1c8a53]'
                      : complaint.npsCategory === 'Passive'
                      ? 'bg-[#eef1f8] text-[#2f9bea]'
                      : 'bg-[#fdece5] text-[#d64545]'
                  }`}
                >
                  {complaint.npsCategory}
                </span>
              </div>
              <div className="text-[10px] text-[#8891a8] mt-0.5">Target: {complaint.targetDate || 'TBD'}</div>
            </div>
          </div>

          {/* Voice of Customer Statement */}
          <div className="border border-[#e2e7f2] rounded-xl p-4 bg-white shadow-xs">
            <h4 className="text-xs font-bold text-[#0d1730] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquareWarning className="w-4 h-4 text-[#e35b2a]" />
              Customer Feedback Statement (Voice of Customer)
            </h4>
            <div className="p-3 bg-[#fdf8f6] rounded-lg border border-[#fae4dc] text-xs text-[#222e4d] leading-relaxed italic">
              "{complaint.customerFeedback}"
            </div>
            <div className="text-[11px] text-[#5b6480] mt-2 font-medium">
              Classified Issue: <span className="font-bold text-[#0d1730]">{complaint.defectCategory}</span>
            </div>
          </div>

          {/* Containment Action */}
          <div className="border border-[#e2e7f2] rounded-xl p-4 bg-white shadow-xs">
            <h4 className="text-xs font-bold text-[#0d1730] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#d64545]" />
              Immediate Containment &amp; Segregation Action
            </h4>
            <div className="p-3 bg-[#fef2f2] rounded-lg border border-[#fecaca] text-xs text-[#7f1d1d] font-medium leading-relaxed">
              {complaint.containmentAction}
            </div>
          </div>

          {/* Root Cause & Corrective Countermeasure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-[#e2e7f2] rounded-xl p-3.5 bg-white">
              <h4 className="text-xs font-bold text-[#0d1730] uppercase tracking-wider mb-1 text-[#424e6b]">
                Root Cause Analysis
              </h4>
              <p className="text-xs text-[#5b6480] leading-relaxed">
                {complaint.rootCauseAnalysis || 'Investigation ongoing by quality process engineering team.'}
              </p>
            </div>

            <div className="border border-[#e2e7f2] rounded-xl p-3.5 bg-white">
              <h4 className="text-xs font-bold text-[#0d1730] uppercase tracking-wider mb-1 text-[#424e6b]">
                Preventive Countermeasures
              </h4>
              <p className="text-xs text-[#5b6480] leading-relaxed">
                {complaint.preventiveAction || 'Corrective action plan being formulated under ISO 9001 / IPC-A-610.'}
              </p>
            </div>
          </div>

          {/* Assigned Engineer & Traceability Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e2e7f2]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#5b6480]" />
              <div>
                <div className="text-[10px] text-[#5b6480]">Assigned Quality Engineer</div>
                <div className="font-semibold text-xs text-[#0d1730]">{complaint.assignedEngineer}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {complaint.capaRef && (
                <div className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-[#eef1f8] text-[#2f9bea]">
                  <span>CAPA Ref:</span>
                  <span className="font-bold">{complaint.capaRef}</span>
                </div>
              )}
              {complaint.rcaRef && (
                <div className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-[#fdece5] text-[#e35b2a]">
                  <span>RCA Ref:</span>
                  <span className="font-bold">{complaint.rcaRef}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#e2e7f2] shrink-0 mt-4 print:hidden">
          <div className="text-[11px] text-[#5b6480]">
            Created: {new Date(complaint.createdAt).toLocaleDateString()} · Last Updated:{' '}
            {new Date(complaint.updatedAt).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToRca && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToRca(complaint);
                  onClose();
                }}
                className="px-3 py-2 rounded-lg bg-[#122040] hover:bg-[#1c305c] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch RCA Report for this Defect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#eef1f8] hover:bg-[#e2e7f2] text-[#0d1730] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
