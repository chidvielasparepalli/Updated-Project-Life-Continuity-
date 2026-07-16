import React, { useState, useEffect } from "react";
import { Folder, Upload, Shield, ShieldAlert, Sparkles, FileText, Trash2, CheckCircle, RefreshCcw, Eye, FileSpreadsheet } from "lucide-react";
import { DocumentType } from "../types";

interface DocumentVaultProps {
  uid: string;
}

export default function DocumentVault({ uid }: DocumentVaultProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("All");
  const [uploading, setUploading] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  // Active document selected for metadata modal/drawer view
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [extraction, setExtraction] = useState<any | null>(null);
  const [editingExtraction, setEditingExtraction] = useState(false);

  // New document form state
  const [docType, setDocType] = useState<DocumentType>(DocumentType.Insurance);
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Backup & Decrypt Engine States
  const [showExportPass, setShowExportPass] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportingZIP, setExportingZIP] = useState(false);
  
  const [showDecryptTool, setShowDecryptTool] = useState(false);
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState("");
  const [decryptedFiles, setDecryptedFiles] = useState<any[]>([]);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/documents/${uid}`);
      const data = await res.json();
      setDocuments(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadPreset = async (presetKey: string) => {
    setLoadingPreset(presetKey);
    try {
      const res = await fetch("/api/documents/preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, presetKey })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDocuments();
        if (data.document) {
          setSelectedDoc(data.document);
          setExtraction(data.extraction);
          setEditingExtraction(false);
        }
        setSuccessFeedback("Preset loaded successfully!");
      } else {
        const err = await res.json();
        setErrorFeedback(err.error || "Failed to load preset");
      }
    } catch (e) {
      console.error(e);
      setErrorFeedback("Error connecting to preset server.");
    } finally {
      setLoadingPreset(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [uid]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            documentType: docType,
            fileName: file.name,
            fileBase64: base64,
            notes
          })
        });

        if (res.ok) {
          setNotes("");
          fetchDocuments();
        }
      } catch (err) {
        console.error("Upload error", err);
      } finally {
        setUploading(false);
      }
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragOver(true);
    } else if (e.type === "dragleave") {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleToggleNominee = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/toggle-nominee`, {
        method: "PUT"
      });
      if (res.ok) {
        fetchDocuments();
        if (selectedDoc && selectedDoc.id === docId) {
          setSelectedDoc({ ...selectedDoc, isNomineeAccessSecured: !selectedDoc.isNomineeAccessSecured });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this document from your vault? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchDocuments();
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null);
          setExtraction(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExtractAI = async (docId: string) => {
    setExtractingId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}/extract`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchDocuments();
        if (selectedDoc?.id === docId) {
          setExtraction(data.extraction);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExtractingId(null);
    }
  };

  const handleViewExtraction = async (doc: any) => {
    setSelectedDoc(doc);
    setExtraction(null);
    setEditingExtraction(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}/extraction`);
      const data = await res.json();
      setExtraction(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}/extraction`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extraction)
      });
      if (res.ok) {
        setEditingExtraction(false);
        const updated = await res.json();
        setExtraction(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportZIP = async () => {
    setExportingZIP(true);
    try {
      const res = await fetch(`/api/documents/${uid}/export-zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: exportPassword })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `vault_export_secured.zip.enc`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setShowExportPass(false);
        setExportPassword("");
        setSuccessFeedback("ZIP backup generated and downloaded successfully!");
      } else {
        const errData = await res.json();
        setErrorFeedback(errData.error || "Failed to export ZIP");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExportingZIP(false);
    }
  };

  const handleDecryptFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDecryptFile(e.target.files[0]);
      setDecryptError("");
      setDecryptedFiles([]);
    }
  };

  const resetDecryptState = () => {
    setDecryptFile(null);
    setDecryptPassword("");
    setDecryptError("");
    setDecryptedFiles([]);
  };

  const handleDecryptSubmit = () => {
    if (!decryptFile) return;
    setDecrypting(true);
    setDecryptError("");
    
    const reader = new FileReader();
    reader.readAsDataURL(decryptFile);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch("/api/documents/decrypt-zip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileBase64: base64, password: decryptPassword })
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
          setDecryptedFiles(data.files || []);
        } else {
          setDecryptError(data.error || "Failed to decrypt. Please verify your passphrase.");
        }
      } catch (err) {
        setDecryptError("Failed to connect to decryption engine.");
      } finally {
        setDecrypting(false);
      }
    };
  };

  const filteredDocs = filterType === "All"
    ? documents
    : documents.filter(d => d.documentType === filterType);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#e0dafc]">
      
      {errorFeedback && (
        <div className="lg:col-span-3 bg-red-950/50 border border-red-500/30 text-red-300 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-md">
          <span className="font-semibold">{errorFeedback}</span>
          <button onClick={() => setErrorFeedback(null)} className="text-red-400 hover:text-red-300 font-black cursor-pointer px-2 py-1">Dismiss</button>
        </div>
      )}
      
      {successFeedback && (
        <div className="lg:col-span-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-md">
          <span className="font-semibold">{successFeedback}</span>
          <button onClick={() => setSuccessFeedback(null)} className="text-emerald-400 hover:text-emerald-300 font-black cursor-pointer px-2 py-1">Dismiss</button>
        </div>
      )}

      {/* Left Column Stack */}
      <div className="space-y-6 lg:col-span-1">
        {/* File Upload & Config Panel */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
          <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upload Vault Asset</h3>
            <p className="text-xs text-[#5d6fa3]">Add secure identity or contract items</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-[#5d6fa3] tracking-wider">Document Classification</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
              id="upload-select-type"
            >
              {Object.values(DocumentType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-[#5d6fa3] tracking-wider">Upload Notes / Context</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl focus:outline-none focus:border-[#e0dafc] text-xs resize-none text-[#e0dafc]"
              placeholder="e.g. Life insurance plan coverage, password or instructions..."
              id="upload-notes"
            />
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
              dragOver
                ? "border-[#e0dafc] bg-[#1e233a]/95 scale-[0.99]"
                : "border-[#5d6fa3]/40 hover:border-[#e0dafc]/60 bg-[#1e233a]"
            }`}
            id="drag-drop-zone"
          >
            <Folder className="h-10 w-10 text-[#5d6fa3] mb-3" />
            <p className="text-xs font-bold text-white">Drag & Drop document here</p>
            <p className="text-[10px] text-[#5d6fa3] mt-1">or click to browse from system explorer</p>
            
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file-input-vault"
            />
            <label
              htmlFor="file-input-vault"
              className="mt-4 px-4 py-2.5 bg-[#2c3353] hover:bg-[#5d6fa3]/20 text-xs font-bold text-[#e0dafc] border border-[#5d6fa3]/30 rounded-xl cursor-pointer transition-colors"
            >
              Select File
            </label>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 animate-pulse">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Writing file to secure sandbox directory...
            </div>
          )}
        </div>
      </div>

      {/* Demo OCR Presets Card */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4" id="demo-ocr-presets-card">
        <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
          <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Demo OCR Presets</h3>
            <p className="text-xs text-[#5d6fa3]">Instant high-fidelity OCR scanning</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] text-indigo-200/70 leading-normal">
            Select a pre-configured document preset to experience automatic AI data extraction instantly. Perfect for sandbox testing without uploading real sensitive credentials.
          </p>

          <div className="space-y-2">
            {[
              {
                key: "metlife",
                title: "MetLife Term Life Continuity",
                tag: "Insurance",
                desc: "$1,000,000 Death Benefit",
                color: "text-blue-400 bg-blue-950/40 border-blue-900/50"
              },
              {
                key: "aetna",
                title: "Aetna Corporate Health Shield",
                tag: "Medical Report",
                desc: "100% Cashless • Bed Charges",
                color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/50"
              },
              {
                key: "resilience_id",
                title: "State Resilience ID Card",
                tag: "Other",
                desc: "Emergency Identity • Vitals",
                color: "text-purple-400 bg-purple-950/40 border-purple-900/50"
              }
            ].map(preset => {
              const isSelected = selectedDoc?.fileName && selectedDoc.fileName.toLowerCase().includes(preset.key);
              return (
                <button
                  key={preset.key}
                  disabled={!!loadingPreset}
                  type="button"
                  onClick={() => handleLoadPreset(preset.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between items-stretch gap-1 cursor-pointer group ${
                    isSelected
                      ? "bg-[#1e233a] border-indigo-400/80 shadow-md"
                      : "bg-[#1e233a]/60 hover:bg-[#1e233a] border-[#5d6fa3]/20 hover:border-[#5d6fa3]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {preset.title}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${preset.color}`}>
                      {preset.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#5d6fa3]">
                    <span>{preset.desc}</span>
                    {loadingPreset === preset.key ? (
                      <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                        <RefreshCcw className="h-3 w-3 animate-spin" /> Load...
                      </span>
                    ) : (
                      <span className="text-indigo-400/80 group-hover:text-indigo-300 font-bold uppercase text-[9px] tracking-wider">
                        Load Preset →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Encrypted Backup Engine Card */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
          <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Encrypted Backup Engine</h3>
            <p className="text-xs text-[#5d6fa3]">Export & Decrypt Vault Archives</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Export section */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-[#5d6fa3] tracking-wider">Secure ZIP Export</p>
            <p className="text-[10px] text-indigo-200/70 leading-normal">Download your entire vault as a password-secured, military-grade encrypted archive.</p>
            
            {showExportPass ? (
              <div className="p-3 bg-[#1e233a] border border-[#5d6fa3]/20 rounded-xl space-y-2.5 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5d6fa3] uppercase">Set Encryption Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter decryption password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    className="w-full bg-[#2c3353] border border-[#5d6fa3]/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setShowExportPass(false)}
                    className="px-2.5 py-1.5 bg-[#2c3353] text-[#5d6fa3] text-[10px] font-bold rounded-lg hover:bg-[#5d6fa3]/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportZIP}
                    disabled={exportingZIP || !exportPassword}
                    className="px-2.5 py-1.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-lg hover:brightness-115 disabled:opacity-50"
                  >
                    {exportingZIP ? "Exporting..." : "Download encrypted ZIP"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setShowExportPass(true); setShowDecryptTool(false); }}
                className="w-full py-2.5 bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                Export Encrypted Vault ZIP
              </button>
            )}
          </div>

          <div className="border-t border-[#5d6fa3]/10 pt-3 space-y-2">
            <p className="text-[10px] font-black uppercase text-[#5d6fa3] tracking-wider">Vault Decryption Utility</p>
            <p className="text-[10px] text-indigo-200/70 leading-normal">Recover files from a previously exported `.enc` backup file directly in your browser.</p>

            {showDecryptTool ? (
              <div className="p-3 bg-[#1e233a] border border-[#5d6fa3]/20 rounded-xl space-y-2.5 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5d6fa3] uppercase">Select Backup Archive (.enc)</label>
                  <input
                    type="file"
                    accept=".enc"
                    onChange={handleDecryptFileSelect}
                    className="w-full text-[10px] text-[#5d6fa3] bg-[#2c3353] border border-[#5d6fa3]/30 rounded-lg p-1.5 focus:outline-none"
                  />
                </div>
                
                {decryptFile && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#5d6fa3] uppercase">Enter Encryption Key</label>
                      <input
                        type="password"
                        required
                        placeholder="Passphrase used during export"
                        value={decryptPassword}
                        onChange={(e) => setDecryptPassword(e.target.value)}
                        className="w-full bg-[#2c3353] border border-[#5d6fa3]/30 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    {decryptError && (
                      <p className="text-[10px] text-red-400 font-bold leading-normal">{decryptError}</p>
                    )}
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => { setShowDecryptTool(false); resetDecryptState(); }}
                        className="px-2.5 py-1.5 bg-[#2c3353] text-[#5d6fa3] text-[10px] font-bold rounded-lg hover:bg-[#5d6fa3]/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDecryptSubmit}
                        disabled={decrypting || !decryptPassword}
                        className="px-2.5 py-1.5 bg-[#e0dafc] text-[#2c3353] text-[10px] font-black rounded-lg hover:brightness-115 disabled:opacity-50"
                      >
                        {decrypting ? "Decrypting..." : "Decrypt Archive"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Decrypted files */}
                {decryptedFiles.length > 0 && (
                  <div className="space-y-2 border-t border-[#5d6fa3]/15 pt-2 mt-2">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase">Decrypted Assets ({decryptedFiles.length})</p>
                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                      {decryptedFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-1.5 bg-[#2c3353] rounded-lg text-[10px] border border-[#5d6fa3]/15">
                          <span className="truncate text-white font-medium pr-2">{file.name}</span>
                          <a
                            href={file.base64}
                            download={file.name}
                            className="px-1.5 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-[#1e233a] font-bold rounded text-[8px] uppercase tracking-wider"
                          >
                            Save
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setShowDecryptTool(true); setShowExportPass(false); }}
                className="w-full py-2.5 bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCcw className="h-4 w-4 text-purple-400" />
                Open Decryption Terminal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Vault List Panel */}
    <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#5d6fa3]/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Resilience Document Vault</h3>
                <p className="text-xs text-[#5d6fa3]">Protected materials release on emergency validation</p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-1 bg-[#1e233a] p-1 rounded-xl self-start border border-[#5d6fa3]/20" id="vault-filters">
              {["All", ...Object.values(DocumentType)].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    filterType === t
                      ? "bg-[#2c3353] text-[#e0dafc] border border-[#5d6fa3]/20 shadow-md"
                      : "text-[#5d6fa3] hover:text-[#e0dafc]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-[#5d6fa3]">
                <FileText className="h-12 w-12 mx-auto text-[#5d6fa3] opacity-55 mb-3" />
                <p className="text-sm font-semibold text-[#e0dafc]">No secure documents matching criteria.</p>
                <p className="text-xs text-[#5d6fa3] mt-1 max-w-sm mx-auto leading-relaxed">Upload insurance policy folders, healthcare records, or photo IDs to configure nominee handover.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                return (
                  <div
                    key={doc.id}
                    className={`p-4 border rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedDoc?.id === doc.id
                        ? "border-[#e0dafc] bg-[#1e233a]"
                        : "border-[#5d6fa3]/20 bg-[#1e233a] hover:border-[#5d6fa3]/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-[#2c3353] rounded-lg shrink-0 border border-[#5d6fa3]/20">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{doc.fileName}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-[#5d6fa3]">
                          <span className="font-bold uppercase px-1.5 py-0.5 bg-[#2c3353] border border-[#5d6fa3]/25 rounded text-[#e0dafc]">
                            {doc.documentType}
                          </span>
                          <span>Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                        </div>
                        {doc.notes && <p className="text-xs text-[#5d6fa3] mt-1.5 line-clamp-1 italic">"{doc.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {/* Secure toggle */}
                      <button
                        onClick={() => handleToggleNominee(doc.id)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
                          doc.isNomineeAccessSecured
                            ? "bg-green-950/40 border-green-900/50 text-green-400"
                            : "bg-red-950/40 border-red-900/50 text-red-400"
                        }`}
                        title="When active, Nominee can view this document after emergency validation"
                      >
                        {doc.isNomineeAccessSecured ? (
                          <>
                            <Shield className="h-3.5 w-3.5" />
                            Nominee Allowed
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Nominee Blocked
                          </>
                        )}
                      </button>

                      {/* AI Extract */}
                      <button
                        onClick={() => handleExtractAI(doc.id)}
                        disabled={extractingId === doc.id}
                        className="bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-bold text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1 border border-[#5d6fa3]/10 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#2c3353]" />
                        {extractingId === doc.id ? "Analyzing..." : "AI Extract"}
                      </button>

                      <button
                        onClick={() => handleViewExtraction(doc)}
                        className="p-1.5 hover:bg-[#2c3353] rounded-lg text-[#e0dafc] transition-colors border border-transparent hover:border-[#5d6fa3]/20"
                        title="View extracted metadata"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 hover:bg-red-950/40 rounded-lg text-red-400 transition-colors border border-transparent hover:border-red-900/30"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Document AI Extractions Detail Card */}
        {selectedDoc && (
          <div className="bg-[#2c3353] rounded-2xl border border-[#e0dafc]/30 shadow-xl p-6 space-y-4 animate-fade-in text-[#e0dafc]">
            <div className="flex items-center justify-between border-b border-[#5d6fa3]/20 pb-2">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#e0dafc]" />
                  AI Policy Extraction Information
                </h4>
                <p className="text-[10px] text-[#5d6fa3] mt-0.5">Source document: {selectedDoc.fileName}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-xs font-bold text-[#5d6fa3] hover:text-[#e0dafc] transition-colors"
              >
                Close
              </button>
            </div>

            {extraction ? (
              <div>
                {editingExtraction ? (
                  <form onSubmit={handleSaveExtraction} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Policy Number</label>
                        <input
                          type="text"
                          value={extraction.policyNumber || ""}
                          onChange={(e) => setExtraction({ ...extraction, policyNumber: e.target.value })}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="date"
                          value={extraction.expiryDate || ""}
                          onChange={(e) => setExtraction({ ...extraction, expiryDate: e.target.value })}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Coverage Limits & Details</label>
                      <textarea
                        value={extraction.coverage || ""}
                        onChange={(e) => setExtraction({ ...extraction, coverage: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg focus:outline-none focus:border-[#e0dafc] text-xs resize-none text-[#e0dafc]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Nominee on Record</label>
                        <input
                          type="text"
                          value={extraction.nominee || ""}
                          onChange={(e) => setExtraction({ ...extraction, nominee: e.target.value })}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Hospital Partner</label>
                        <input
                          type="text"
                          value={extraction.hospitalName || ""}
                          onChange={(e) => setExtraction({ ...extraction, hospitalName: e.target.value })}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-lg p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#5d6fa3]/20">
                      <button
                        type="button"
                        onClick={() => setEditingExtraction(false)}
                        className="px-3.5 py-1.5 bg-[#1e233a] border border-[#5d6fa3]/25 text-[#e0dafc] text-xs rounded-lg font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-[#e0dafc] text-[#2c3353] text-xs rounded-lg font-black flex items-center gap-1 hover:brightness-110 transition-all"
                      >
                        <CheckCircle className="h-3 w-3 text-[#2c3353]" />
                        Save OCR Data
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1e233a] p-4 rounded-xl border border-[#5d6fa3]/20 text-xs text-[#e0dafc]">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#5d6fa3] tracking-wider">Policy Number</p>
                      <p className="font-bold text-white mt-0.5">{extraction.policyNumber || "Not found (Tap edit)"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#5d6fa3] tracking-wider">Expiry Date</p>
                      <p className="font-bold text-white mt-0.5">{extraction.expiryDate || "Not found"}</p>
                    </div>
                    <div className="sm:col-span-2 border-t border-b border-[#5d6fa3]/10 py-2.5">
                      <p className="text-[10px] uppercase font-bold text-[#5d6fa3] tracking-wider">Coverage Description</p>
                      <p className="text-[#e0dafc] leading-relaxed font-semibold mt-0.5">{extraction.coverage || "No specific coverage extracted."}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#5d6fa3] tracking-wider">Nominee Beneficial</p>
                      <p className="font-bold text-white mt-0.5">{extraction.nominee || "Not found"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#5d6fa3] tracking-wider">Healthcare Partner</p>
                      <p className="font-bold text-white mt-0.5">{extraction.hospitalName || "Not found"}</p>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-[#5d6fa3]/15 mt-2">
                      <button
                        onClick={() => setEditingExtraction(true)}
                        className="bg-[#2c3353] border border-[#5d6fa3]/35 hover:bg-[#1e233a] text-xs font-semibold py-1.5 px-3 rounded-lg text-[#e0dafc] transition-all cursor-pointer"
                      >
                        Edit Fields
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-[#1e233a] border border-[#5d6fa3]/20 rounded-xl text-xs text-[#5d6fa3]">
                <Sparkles className="h-6 w-6 text-[#e0dafc] mx-auto mb-2 animate-bounce" />
                <p>No AI OCR extraction detected for this document yet.</p>
                <button
                  onClick={() => handleExtractAI(selectedDoc.id)}
                  className="mt-3 bg-[#e0dafc] text-[#2c3353] font-black px-4 py-1.5 rounded-lg text-[10px] hover:brightness-110 transition-all inline-block"
                >
                  Run Gemini Intelligent OCR
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
