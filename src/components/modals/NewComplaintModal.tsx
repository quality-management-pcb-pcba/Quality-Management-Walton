import React, { useState, useEffect } from 'react';
import { CustomerComplaint } from '../../types';
import { X, MessageSquareWarning, Plus, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: CustomerComplaint) => void;
  initialData?: CustomerComplaint | null;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEdit = !!initialData;

  const [ticketNo, setTicketNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [accountTier, setAccountTier] = useState<CustomerComplaint['accountTier']>('Tier 1');
  const [npsScore, setNpsScore] = useState<number>(3);
  const [productCategory, setProductCategory] = useState<CustomerComplaint['productCategory']>('PCBA');
  const [modelNo, setModelNo] = useState('');
  const [lotBatchNo, setLotBatchNo] = useState('');
  const [defectCategory, setDefectCategory] = useState('Solder Bridge / Short Circuit');
  const [severity, setSeverity] = useState<CustomerComplaint['severity']>('Major');
  const [receivedDate, setReceivedDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<CustomerComplaint['status']>('Open');
  const [deliveryQty, setDeliveryQty] = useState<number>(5000);
  const [defectQty, setDefectQty] = useState<number>(15);
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [containmentAction, setContainmentAction] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [assignedEngineer, setAssignedEngineer] = useState('Engr. Tanvir Ahmed (Senior QC Lead)');
  const [capaRef, setCapaRef] = useState('');
  const [rcaRef, setRcaRef] = useState('');

  // Auto compute NPS category
  const npsCategory: CustomerComplaint['npsCategory'] =
    npsScore >= 9 ? 'Promoter' : npsScore >= 7 ? 'Passive' : 'Detractor';

  // Auto compute defect rate (%)
  const defectRate =
    deliveryQty > 0 ? Number(((defectQty / deliveryQty) * 100).toFixed(2)) : 0;

  useEffect(() => {
    if (initialData) {
      setTicketNo(initialData.ticketNo);
      setCustomerName(initialData.customerName);
      setAccountTier(initialData.accountTier);
      setNpsScore(initialData.npsScore);
      setProductCategory(initialData.productCategory);
      setModelNo(initialData.modelNo);
      setLotBatchNo(initialData.lotBatchNo);
      setDefectCategory(initialData.defectCategory);
      setSeverity(initialData.severity);
      setReceivedDate(initialData.receivedDate);
      setTargetDate(initialData.targetDate);
      setStatus(initialData.status);
      setDeliveryQty(initialData.deliveryQty);
      setDefectQty(initialData.defectQty);
      setCustomerFeedback(initialData.customerFeedback);
      setContainmentAction(initialData.containmentAction);
      setRootCauseAnalysis(initialData.rootCauseAnalysis || '');
      setPreventiveAction(initialData.preventiveAction || '');
      setAssignedEngineer(initialData.assignedEngineer);
      setCapaRef(initialData.capaRef || '');
      setRcaRef(initialData.rcaRef || '');
    } else {
      const randomCode = `VOC-2026-${Math.floor(100 + Math.random() * 900)}`;
      setTicketNo(randomCode);
      setCustomerName('');
      setAccountTier('Tier 1');
      setNpsScore(3);
      setProductCategory('PCBA');
      setModelNo('');
      setLotBatchNo(`LOT-2609-W${Math.floor(10 + Math.random() * 90)}`);
      setDefectCategory('Solder Bridge / Short Circuit');
      setSeverity('Major');
      const today = new Date().toISOString().split('T')[0];
      setReceivedDate(today);
      const target = new Date();
      target.setDate(target.getDate() + 14);
      setTargetDate(target.toISOString().split('T')[0]);
      setStatus('Open');
      setDeliveryQty(5000);
      setDefectQty(15);
      setCustomerFeedback('');
      setContainmentAction('');
      setRootCauseAnalysis('');
      setPreventiveAction('');
      setAssignedEngineer('Engr. Tanvir Ahmed (Senior QC Lead)');
      setCapaRef('');
      setRcaRef('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (type: 'solder' | 'pcb' | 'burnout') => {
    if (type === 'solder') {
      setCustomerName('Walton Hi-Tech Industries PLC (Refrigerator Division)');
      setAccountTier('Tier 1');
      setProductCategory('PCBA');
      setModelNo('WLT-INV-REF-48V');
      setDefectCategory('Solder Bridge / Short Circuit');
      setSeverity('Critical');
      setNpsScore(2);
      setDeliveryQty(4800);
      setDefectQty(32);
      setCustomerFeedback('Intermittent dead short identified at SMT power rail pins during assembly line functional testing.');
      setContainmentAction('Quarantine warehouse lot LOT-2609-W01. SMT stencil aperture inspection triggered.');
      setRootCauseAnalysis('Excessive solder paste deposition due to squeegee pressure drift on SMT Line 2.');
      setPreventiveAction('Enforce automated 3D SPI height and volume verification before reflow oven entrance.');
      setCapaRef('CAPA-2026-008');
      setRcaRef('RCA-2026-005');
    } else if (type === 'pcb') {
      setCustomerName('Walton Digi-Tech (Computer & Display Division)');
      setAccountTier('Tier 1');
      setProductCategory('PCB');
      setModelNo('WLT-MB-H610-D4');
      setDefectCategory('Trace Delamination / Blistering');
      setSeverity('Major');
      setNpsScore(4);
      setDeliveryQty(2500);
      setDefectQty(14);
      setCustomerFeedback('Blistering noted between Layer 2 and Layer 3 after convection reflow soldering.');
      setContainmentAction('Mandatory pre-bake of all bare PCBs at 125°C for 4 hours before surface mounting.');
      setRootCauseAnalysis('Moisture absorption exceeding floor life limit in temporary staging buffer.');
      setPreventiveAction('Vacuum sealing with desiccant and humidity indicator cards (HIC) for all internal PCB transport.');
      setRcaRef('RCA-2026-006');
    } else if (type === 'burnout') {
      setCustomerName('Marcel Consumer Electronics (Air Conditioner Unit)');
      setAccountTier('Tier 2');
      setProductCategory('PCBA');
      setModelNo('MAR-AC-ODU-V3');
      setDefectCategory('Burnout / Thermal Overheat');
      setSeverity('Critical');
      setNpsScore(1);
      setDeliveryQty(3200);
      setDefectQty(9);
      setCustomerFeedback('MOSFET driver stage burnt out during high ambient temperature 45°C endurance validation.');
      setContainmentAction('100% thermal imaging screening of all assembled outdoor inverter modules.');
      setRootCauseAnalysis('Insufficient thermal paste dispensing volume on heatsink interface plate.');
      setPreventiveAction('Automated robotic thermal grease dispensing with optical bead vision sensor.');
      setCapaRef('CAPA-2026-009');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !modelNo.trim() || !customerFeedback.trim()) {
      alert('Please fill in Customer Name, Model / Part Number, and Customer Feedback.');
      return;
    }

    const complaintItem: CustomerComplaint = {
      id: initialData ? initialData.id : `voc-${Date.now()}`,
      ticketNo: ticketNo.trim() || `VOC-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: customerName.trim(),
      accountTier,
      npsScore,
      npsCategory,
      productCategory,
      modelNo: modelNo.trim(),
      lotBatchNo: lotBatchNo.trim() || 'N/A',
      defectCategory,
      severity,
      receivedDate: receivedDate || new Date().toISOString().split('T')[0],
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      status,
      deliveryQty: Number(deliveryQty) || 0,
      defectQty: Number(defectQty) || 0,
      defectRate,
      customerFeedback: customerFeedback.trim(),
      containmentAction: containmentAction.trim() || 'Under initial review by Quality Assurance team.',
      rootCauseAnalysis: rootCauseAnalysis.trim() || undefined,
      preventiveAction: preventiveAction.trim() || undefined,
      assignedEngineer: assignedEngineer.trim() || 'Engr. Tanvir Ahmed (Senior QC Lead)',
      capaRef: capaRef.trim() || undefined,
      rcaRef: rcaRef.trim() || undefined,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(complaintItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-6 p-5 sm:p-6 shadow-2xl border border-[#e2e7f2] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e2e7f2] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#fdece5] text-[#e35b2a]">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0d1730]">
                {isEdit ? 'Edit Customer Complaint / VOC Entry' : 'New Customer Complaint & VOC Entry'}
              </h3>
              <p className="text-xs text-[#5b6480]">
                Record customer feedback, defect metrics, NPS score, and containment actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5b6480] hover:bg-[#eef1f8] hover:text-[#0d1730] transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Pre-fill Templates */}
        {!isEdit && (
          <div className="pt-3 pb-2 px-1 flex flex-wrap items-center gap-2 text-xs shrink-0 bg-[#f8fafc] -mx-5 px-5 sm:-mx-6 sm:px-6 border-b border-[#eef1f8]">
            <span className="text-[11px] font-bold text-[#5b6480] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#e35b2a]" /> Quick Templates:
            </span>
            <button
              type="button"
              onClick={() => handleApplyTemplate('solder')}
              className="px-2.5 py-1 rounded-md bg-white border border-[#d2d9eb] text-[#122040] hover:border-[#e35b2a] hover:text-[#e35b2a] text-[11px] font-medium transition-colors cursor-pointer"
            >
              SMT Solder Short (Reflow)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('pcb')}
              className="px-2.5 py-1 rounded-md bg-white border border-[#d2d9eb] text-[#122040] hover:border-[#2f9bea] hover:text-[#2f9bea] text-[11px] font-medium transition-colors cursor-pointer"
            >
              PCB Delamination (Fab)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('burnout')}
              className="px-2.5 py-1 rounded-md bg-white border border-[#d2d9eb] text-[#122040] hover:border-[#d64545] hover:text-[#d64545] text-[11px] font-medium transition-colors cursor-pointer"
            >
              MOSFET Burnout (AC Controller)
            </button>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Row 1: Ticket No & Account Tier & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Ticket / Case ID *</label>
              <input
                required
                type="text"
                value={ticketNo}
                onChange={(e) => setTicketNo(e.target.value)}
                placeholder="VOC-2026-001"
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono font-bold bg-[#f8fafc] text-[#0d1730]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Customer Account Tier *</label>
              <select
                value={accountTier}
                onChange={(e) => setAccountTier(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white text-[#0d1730]"
              >
                <option value="Tier 1">Tier 1 (Enterprise Appliance)</option>
                <option value="Tier 2">Tier 2 (Consumer Electronics)</option>
                <option value="Tier 3">Tier 3 (Export Subcontract)</option>
                <option value="Tier 4">Tier 4 (Internal Components)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Complaint Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white font-semibold text-[#0d1730]"
              >
                <option value="Open">Open (Pending Triage)</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Containment Active">Containment Active</option>
                <option value="CAPA Initiated">CAPA Initiated</option>
                <option value="RCA In Progress">RCA In Progress</option>
                <option value="Resolved">Resolved (Validated)</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Row 2: Customer Name with Quick Fill Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-[#39425d]">Customer / Client Name *</label>
              <div className="text-[10.5px] text-[#5b6480]">e.g. Division, Sister Concern or External Client</div>
            </div>
            <input
              required
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Walton Hi-Tech Industries PLC (Refrigerator Division)"
              className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white text-[#0d1730]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                'Walton Hi-Tech (Ref)',
                'Walton Digi-Tech (PC/Display)',
                'Marcel (Air Conditioner)',
                'Walton Hi-Tech (Washing Machine)',
                'Vision Electronics',
                'Export OEM Subcontract',
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCustomerName(c)}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#f1f4f9] hover:bg-[#e2e7f2] text-[#424e6b] transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Product Category, Model, Lot & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Category *</label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white"
              >
                <option value="PCBA">PCBA Assembly</option>
                <option value="PCB">Bare PCB Board</option>
                <option value="Component">Raw Component</option>
                <option value="Finished Module">Finished Module</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Model / Part No *</label>
              <input
                required
                type="text"
                value={modelNo}
                onChange={(e) => setModelNo(e.target.value)}
                placeholder="e.g. WLT-INV-REF-48V"
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Lot / Batch No</label>
              <input
                type="text"
                value={lotBatchNo}
                onChange={(e) => setLotBatchNo(e.target.value)}
                placeholder="e.g. LOT-2609-R01"
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white font-semibold"
              >
                <option value="Critical">Critical (Line Stop / Safety)</option>
                <option value="Major">Major (Function Failure)</option>
                <option value="Minor">Minor (Cosmetic / Low)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Defect Category & Quantities & Calculated Defect Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#eef1f8]">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#39425d] mb-1">Defect Classification *</label>
              <select
                value={defectCategory}
                onChange={(e) => setDefectCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white"
              >
                <option value="Solder Bridge / Short Circuit">Solder Bridge / Short Circuit</option>
                <option value="Cold Solder / Insufficient Wetting">Cold Solder / Insufficient Wetting</option>
                <option value="Trace Delamination / Blistering">Trace Delamination / Blistering</option>
                <option value="Missing Component">Missing Component</option>
                <option value="Misaligned Component / Tombstone">Misaligned Component / Tombstone</option>
                <option value="Burnout / Thermal Overheat">Burnout / Thermal Overheat</option>
                <option value="Firmware / Boot Failure">Firmware / Checksum / Boot Failure</option>
                <option value="Cosmetic Scuffs / Mask Scratches">Cosmetic Scuffs / Mask Scratches</option>
                <option value="Dimension / Warpage Out of Spec">Dimension / Warpage Out of Spec</option>
                <option value="Packaging / ESD Damage">Packaging / ESD Handling Damage</option>
                <option value="Other Field Failure">Other Field Failure</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Delivery Qty</label>
              <input
                type="number"
                min="1"
                value={deliveryQty}
                onChange={(e) => setDeliveryQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Failed Qty</label>
              <input
                type="number"
                min="0"
                value={defectQty}
                onChange={(e) => setDefectQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono bg-white"
              />
              <div className="text-[10px] text-[#5b6480] mt-1 font-mono">
                Defect Rate: <span className="font-bold text-[#e35b2a]">{defectRate}%</span>
              </div>
            </div>
          </div>

          {/* Row 5: NPS Rating Interactive Selector */}
          <div className="bg-[#fdf8f6] p-3 rounded-xl border border-[#fae4dc]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="font-semibold text-[#0d1730] flex items-center gap-1.5">
                <span>Customer Satisfaction NPS Rating (0–10)</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    npsCategory === 'Promoter'
                      ? 'bg-[#e5f7ee] text-[#1c8a53]'
                      : npsCategory === 'Passive'
                      ? 'bg-[#eef1f8] text-[#2f9bea]'
                      : 'bg-[#fdece5] text-[#d64545]'
                  }`}
                >
                  {npsCategory} ({npsScore}/10)
                </span>
              </label>
              <span className="text-[11px] text-[#5b6480]">
                0-6: Detractor · 7-8: Passive · 9-10: Promoter
              </span>
            </div>

            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                const isSelected = npsScore === score;
                const isDetractor = score <= 6;
                const isPassive = score === 7 || score === 8;

                let activeClass = 'bg-[#d64545] text-white border-[#d64545] shadow-xs';
                if (isPassive) activeClass = 'bg-[#2f9bea] text-white border-[#2f9bea] shadow-xs';
                if (!isDetractor && !isPassive) activeClass = 'bg-[#28ad6b] text-white border-[#28ad6b] shadow-xs';

                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setNpsScore(score)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? activeClass
                        : 'bg-white border-[#d2d9eb] text-[#424e6b] hover:bg-[#eef1f8]'
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Customer Voice Feedback (VOC) */}
          <div>
            <label className="block font-semibold text-[#39425d] mb-1">
              Voice of Customer (VOC) / Customer Feedback Statement *
            </label>
            <textarea
              required
              rows={3}
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              placeholder="State the customer's exact statement, observed malfunction, operating conditions, and consequences..."
              className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white text-[#0d1730]"
            />
          </div>

          {/* Row 7: Immediate Containment Action */}
          <div>
            <label className="block font-semibold text-[#39425d] mb-1">
              Immediate Containment Action (Warehouse Quarantine / Line Purge)
            </label>
            <input
              type="text"
              value={containmentAction}
              onChange={(e) => setContainmentAction(e.target.value)}
              placeholder="e.g. Quarantine affected inventory, 100% optical inspection on pending shipments, notify production lead..."
              className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white"
            />
          </div>

          {/* Row 8: Root Cause & Preventive Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">
                Root Cause Analysis (Preliminary Finding)
              </label>
              <textarea
                rows={2}
                value={rootCauseAnalysis}
                onChange={(e) => setRootCauseAnalysis(e.target.value)}
                placeholder="Preliminary investigation result (e.g. 4M analysis, machine parameter drift, material issue)..."
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">
                Long-term Preventive Action / Corrective Countermeasure
              </label>
              <textarea
                rows={2}
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                placeholder="Engineering changes, tool replacements, SOP revision, automated sensor gates..."
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          {/* Row 9: Dates & Engineer & Links */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-[#eef1f8]">
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Received Date *</label>
              <input
                required
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Target Close Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Assigned QC Engineer</label>
              <input
                type="text"
                value={assignedEngineer}
                onChange={(e) => setAssignedEngineer(e.target.value)}
                placeholder="e.g. Engr. Tanvir Ahmed"
                className="w-full px-3 py-2 border border-[#d2d9eb] rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#39425d] mb-1">Linked CAPA / RCA No</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={capaRef}
                  onChange={(e) => setCapaRef(e.target.value)}
                  placeholder="CAPA-2026-..."
                  className="w-1/2 px-2 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono bg-white"
                />
                <input
                  type="text"
                  value={rcaRef}
                  onChange={(e) => setRcaRef(e.target.value)}
                  placeholder="RCA-..."
                  className="w-1/2 px-2 py-2 border border-[#d2d9eb] rounded-lg text-xs font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e2e7f2] shrink-0 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5b6480] hover:bg-[#eef1f8] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#e35b2a] hover:bg-[#c74a1f] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Submit & Log Complaint'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
