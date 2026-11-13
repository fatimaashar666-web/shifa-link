"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  Download,
  Share2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Eye,
} from "lucide-react";

type MedicalRecordCategory =
  | "LAB_REPORT"
  | "RADIOLOGY_IMAGE"
  | "PRESCRIPTION"
  | "DISCHARGE_SUMMARY"
  | "VACCINATION"
  | "OTHER";

interface FileObjectDto {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface AccessGrantDto {
  id: string;
  doctorId: string;
  expiresAt: string;
  revokedAt: string | null;
}

interface MedicalRecord {
  id: string;
  title: string;
  category: MedicalRecordCategory;
  description: string | null;
  recordDate: string;
  fileObject: FileObjectDto;
  accessGrants: AccessGrantDto[];
}

const CATEGORY_LABEL_KEYS: Record<MedicalRecordCategory, string> = {
  LAB_REPORT: "labReport",
  RADIOLOGY_IMAGE: "radiology",
  PRESCRIPTION: "prescription",
  DISCHARGE_SUMMARY: "dischargeSummary",
  VACCINATION: "vaccination",
  OTHER: "other",
};

const CATEGORY_COLORS: Record<MedicalRecordCategory, string> = {
  LAB_REPORT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  RADIOLOGY_IMAGE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PRESCRIPTION: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  DISCHARGE_SUMMARY: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  VACCINATION: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  OTHER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ShifaDriveClient() {
  const t = useTranslations("driveWorkspace");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [revokingGrantId, setRevokingGrantId] = useState<string | null>(null);
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);

  // Upload form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<MedicalRecordCategory>("LAB_REPORT");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadRecords = useCallback(() => {
    fetch("/api/v1/medical-records")
      .then((res) => {
        if (!res.ok) throw new Error(t("loadError"));
        return res.json();
      })
      .then((data: { records?: MedicalRecord[] }) => {
        setRecords(data.records ?? []);
        setLoading(false);
      })
      .catch((err) => {
          setError(err instanceof Error ? err.message : t("couldNotLoad"));
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleDownload(recordId: string) {
    setDownloadingId(recordId);
    try {
      const res = await fetch(`/api/v1/medical-records/${recordId}/download`);
      if (!res.ok) throw new Error(t("couldNotGetDownloadLink"));
      const data = await res.json() as { downloadUrl: string };
      window.open(data.downloadUrl, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : t("downloadFailed"));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleRevokeGrant(recordId: string, grantId: string) {
    setRevokingGrantId(grantId);
    try {
      const res = await fetch(`/api/v1/medical-records/${recordId}/share/${grantId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(t("revokeFailed"));
      await loadRecords();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("revokeFailed"));
    } finally {
      setRevokingGrantId(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      setUploadError(t("selectFileAndTitle"));
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Step 1: Get presigned upload URL
      const urlRes = await fetch("/api/v1/medical-records/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.name,
          mimeType: uploadFile.type,
          sizeBytes: uploadFile.size,
          category: uploadCategory,
        }),
      });

      if (!urlRes.ok) {
        const data = await urlRes.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? t("failedInitiateUpload"));
      }

      const { uploadUrl, storageKey } = await urlRes.json() as {
        uploadUrl: string;
        storageKey: string;
      };

      // Step 2: Upload file to the bucket. If browser CORS blocks the
      // presigned URL, retry through the authenticated same-origin proxy.
      const uploadThroughProxy = async () => {
        const proxyForm = new FormData();
        proxyForm.append("file", uploadFile);
        proxyForm.append("storageKey", storageKey);

        const proxyRes = await fetch("/api/v1/medical-records/upload-proxy", {
          method: "POST",
          body: proxyForm,
        });

        if (!proxyRes.ok) {
          const data = await proxyRes.json().catch(() => ({})) as { message?: string };
          throw new Error(data.message ?? t("fileUploadFailed"));
        }
      };

      if (!uploadUrl.startsWith("/api/")) {
        let uploaded = false;

        try {
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": uploadFile.type },
            body: uploadFile,
          });
          uploaded = uploadRes.ok;
        } catch {
          uploaded = false;
        }

        if (!uploaded) {
          await uploadThroughProxy();
        }
      } else {
        await uploadThroughProxy();
      }
      // In dev, the storageKey is registered directly (file bytes aren't stored)

      // Step 3: Register metadata in DB
      const registerRes = await fetch("/api/v1/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey,
          fileName: uploadFile.name,
          mimeType: uploadFile.type,
          sizeBytes: uploadFile.size,
          title: uploadTitle,
          category: uploadCategory,
          description: uploadDescription || undefined,
        }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? t("failedRegisterRecord"));
      }

      setUploadSuccess(true);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadRecords();
      setTimeout(() => {
        setUploadPanelOpen(false);
        setUploadSuccess(false);
      }, 1500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Panel Toggle */}
      <div className="flex justify-end">
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => {
            setUploadPanelOpen((v) => !v);
            setUploadError(null);
            setUploadSuccess(false);
          }}
        >
          <Upload className="h-4 w-4" />
            {uploadPanelOpen ? t("closeUpload") : t("uploadRecord")}
        </Button>
      </div>

      {/* Upload Form */}
      {uploadPanelOpen && (
        <Card className="border-blue-200 dark:border-blue-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              {t("uploadMedicalRecord")}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleUpload}>
            <CardContent className="space-y-4">
              {uploadError && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
              {uploadSuccess && (
                <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{t("recordUploaded")}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="file" className="text-xs font-medium">
                  {t("fileLabel")} <span className="text-slate-400">{t("fileTypes")}</span>
                </Label>
                <input
                  id="file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.dcm"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium dark:text-slate-400 dark:file:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="uploadTitle" className="text-xs font-medium">{t("titleLabel")}</Label>
                  <input
                    id="uploadTitle"
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={t("titlePlaceholder")}
                    className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-xs dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="uploadCategory" className="text-xs font-medium">{t("categoryLabel")}</Label>
                  <select
                    id="uploadCategory"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as MedicalRecordCategory)}
                    className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-xs dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CATEGORY_LABEL_KEYS).map(([value, labelKey]) => (
                      <option key={value} value={value}>{t(`categories.${labelKey}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="uploadDescription" className="text-xs font-medium">
                  {t("descriptionLabel")} <span className="text-slate-400">({t("optional")})</span>
                </Label>
                <textarea
                  id="uploadDescription"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  rows={2}
                  className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-xs resize-none dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>

            <CardFooter className="border-t border-slate-100 dark:border-slate-800/60 mt-2 gap-2">
              <Button type="submit" size="sm" className="gap-1.5 text-xs" disabled={uploading}>
                {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {uploading ? t("uploading") : t("upload")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setUploadPanelOpen(false)}
              >
                {t("cancel")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Records List */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <HardDrive className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500">{t("emptyTitle")}</p>
          <p className="text-xs text-slate-400">
            {t("emptyDescription")}
          </p>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="space-y-4">
          {records.map((record) => {
            const activeGrants = record.accessGrants.filter(
              (g) => !g.revokedAt && new Date(g.expiresAt) > new Date(),
            );

            return (
              <Card key={record.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{record.title}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {record.fileObject.fileName} · {formatBytes(record.fileObject.sizeBytes)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-medium shrink-0 ${CATEGORY_COLORS[record.category] ?? ""}`}
                    >
                      {t(`categories.${CATEGORY_LABEL_KEYS[record.category]}`)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  {record.description && <p>{record.description}</p>}
                  <p className="text-[10px] text-slate-400">
                    {t("recordDate")}:{" "}
                    {new Date(record.recordDate).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                  </p>

                  {activeGrants.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                        <Eye className="h-3 w-3" />
                        {t("sharedWith")} ({activeGrants.length})
                      </div>
                      {activeGrants.map((grant) => (
                        <div
                          key={grant.id}
                          className="flex items-center justify-between rounded bg-slate-50 dark:bg-slate-800/50 px-2 py-1"
                        >
                          <span className="text-[10px] text-slate-500">
                            {t("doctorId")} {grant.doctorId.slice(0, 8)}…
                            &nbsp;·&nbsp;{t("expires")} {" "}
                            {new Date(grant.expiresAt).toLocaleDateString("en-PK", { dateStyle: "short" })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-[10px] text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => void handleRevokeGrant(record.id, grant.id)}
                            disabled={revokingGrantId === grant.id}
                          >
                            {revokingGrantId === grant.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            {t("revoke")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => void handleDownload(record.id)}
                    disabled={downloadingId === record.id}
                  >
                    {downloadingId === record.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {t("download")}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                    onClick={() => alert(t("shareNotAvailable"))}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {t("share")}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
