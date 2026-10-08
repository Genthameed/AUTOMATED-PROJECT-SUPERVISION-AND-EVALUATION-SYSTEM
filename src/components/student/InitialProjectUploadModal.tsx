import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Paperclip, 
  Sparkles, 
  Building2,
  BookOpen,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InitialProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InitialProjectUploadModal: React.FC<InitialProjectUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, studentProject, uploadInitialProject, showToast } = useApp();

  const [topicTitle, setTopicTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [objectives, setObjectives] = useState<string[]>([
    'Formulate and validate experimental design with assigned supervisor.',
    'Conduct comprehensive literature review of contemporary research in this specialization.',
    'Draft and defend Chapter 1 to 3 before the Departmental Panel.',
  ]);
  const [newObjective, setNewObjective] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const assignedSupervisor = currentUser?.assignedSupervisorName || studentProject?.supervisorName;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!topicTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTopicTitle(cleanName);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!topicTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTopicTitle(cleanName);
      }
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives(prev => [...prev, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      showToast('Please enter your research project topic title.');
      return;
    }

    setIsSubmitting(true);
    try {
      uploadInitialProject({
        topicTitle: topicTitle.trim(),
        problemStatement: problemStatement.trim() || 'Initial research proposal submitted for departmental supervisor review and validation.',
        objectives: objectives.filter(o => o.trim().length > 0),
        file: selectedFile || undefined,
        fileName: selectedFile ? selectedFile.name : `${topicTitle.trim().substring(0, 30)}_Proposal.pdf`,
      });
      onClose();
    } catch (err) {
      showToast('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-7 shadow-2xl border border-stone-200 my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
              <BookOpen className="h-5 w-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A]">
                Upload Research Project & Proposal
              </h2>
              <p className="text-xs text-stone-500">
                Abubakar Tafawa Balewa University, Bauchi (ATBU) · Department of Computer Science
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Supervisor Context Alert */}
        <div className="rounded-xl border p-3.5 mb-5 text-xs flex items-start gap-3 bg-stone-50 border-stone-200">
          <UserCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            {assignedSupervisor ? (
              <p className="text-stone-800">
                <strong className="text-stone-900 font-bold">Assigned Supervisor: </strong>
                <span className="text-amber-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  {assignedSupervisor}
                </span>
                <span className="block text-stone-600 text-[11px] mt-1">
                  Upon uploading, your proposal will immediately be delivered to this supervisor for review and methodology feedback.
                </span>
              </p>
            ) : (
              <p className="text-stone-700">
                <strong className="text-stone-900 font-bold">Supervisor Status: </strong>
                <span className="text-amber-800 font-medium">Pending Administrator Allocation.</span>
                <span className="block text-stone-500 text-[11px] mt-0.5">
                  You can upload your proposal now. Once the Departmental Admin allocates your supervisor, they will instantly receive your docket.
                </span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Topic Title */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Proposed Research Topic Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={topicTitle || ''}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="e.g. Comparative Genomic and Plasmid Profiling of Multidrug-Resistant ESBL-Producing Enterobacteriaceae..."
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              State the complete academic research title as approved or proposed for departmental defense.
            </p>
          </div>

          {/* Problem Statement */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Problem Statement & Research Scope
            </label>
            <textarea
              rows={3}
              value={problemStatement || ''}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Provide a concise summary of the clinical or environmental research gap, rationale, and study scope..."
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Research Objectives */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Key Research Objectives
            </label>
            <div className="space-y-1.5 mb-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 p-2 border border-stone-200 text-stone-700">
                  <span className="truncate flex-1 font-medium">{idx + 1}. {obj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(idx)}
                    className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newObjective || ''}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddObjective(); } }}
                placeholder="Add specific objective..."
                className="flex-1 rounded-xl border border-stone-300 p-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="rounded-xl border border-stone-300 px-3 py-2 font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Upload Proposal Draft / Concept Note (PDF / DOCX)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-stone-300 bg-stone-50/60 hover:bg-stone-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-xs truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  <Upload className="h-6 w-6 text-stone-400" />
                  <p className="font-semibold text-stone-700 text-xs">
                    Drag and drop your research proposal here, or <span className="text-amber-700 underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Supports PDF, Word (.docx) up to 25MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !topicTitle.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>Submit Research Topic & Proposal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
