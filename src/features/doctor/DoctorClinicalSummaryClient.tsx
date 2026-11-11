"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  FileSearch,
  ShieldCheck,
} from "lucide-react";

interface SourceRecord {
  recordId: string;
  title: string;
  category: string;
  recordDate: string;
  fileName: string;
}

interface ClinicalSummary {
  patientId: string;
  hasActiveConsent: boolean;
  totalRecordsReviewed: number;
  sourceRecords: SourceRecord[];
  clinicalObservations: string[];
  riskFactors: string[];
  uncertaintyFlags: string[];
  confidenceScore: number;
  mandatoryNotice: string;
}

export function DoctorClinicalSummaryClient({ patientId }: { patientId: string }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ClinicalSummary | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/clinical/summary?patientId=${patientId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Failed to compile clinical summary.");
      }
      const data = (await res.json()) as ClinicalSummary;
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating clinical summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!summary) return;
    setAcknowledging(true);
    try {
      const res = await fetch("/api/v1/clinical/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) throw new Error("Failed to record clinician review.");
      setAcknowledged(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to acknowledge summary.");
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div className="space-y-6">
      {!summary && (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 text-center py-12">
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                AI Clinical Records Synthesis
              </h3>
              <p className="text-xs text-slate-500">
                Compile a source-linked synthesis of patient-shared diagnostic files, lab trends, and medication records prior to your consultation.
              </p>
            </div>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
            )}
            <Button onClick={fetchSummary} disabled={loading} className="gap-2 text-xs">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              {loading ? "Synthesizing Records…" : "Generate Clinical Summary"}
            </Button>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="space-y-6">
          {/* Mandatory Review Banner */}
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Mandatory Clinician Review Notice</p>
              <p>{summary.mandatoryNotice}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main synthesis pane */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Clinical Observations & Synthesized History
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Confidence: {(summary.confidenceScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Extracted Findings
                    </h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-700 dark:text-slate-300">
                      {summary.clinicalObservations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>

                  {summary.riskFactors.length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                        Potential Risk Indicators to Clarify
                      </h4>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-700 dark:text-slate-300">
                        {summary.riskFactors.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.uncertaintyFlags.length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-semibold text-slate-500 mb-1">Uncertainty Flags</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-500 italic">
                        {summary.uncertaintyFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>

                {/* Clinician Active Review & Acknowledgment Action */}
                <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    {acknowledged ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Clinical review recorded & acknowledged
                      </span>
                    ) : (
                      "Please confirm that you have reviewed the clinical findings."
                    )}
                  </div>
                  {!acknowledged && (
                    <Button
                      onClick={handleAcknowledge}
                      disabled={acknowledging}
                      size="sm"
                      className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {acknowledging ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      Acknowledge Review
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            {/* Source References & Audit Citations */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Source Citations ({summary.totalRecordsReviewed})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {summary.sourceRecords.length === 0 ? (
                    <p className="text-slate-400 italic">No source files attached.</p>
                  ) : (
                    summary.sourceRecords.map((src) => (
                      <div
                        key={src.recordId}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-1"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {src.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {src.category} • {src.fileName}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          ID: {src.recordId.slice(0, 13)}…
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
