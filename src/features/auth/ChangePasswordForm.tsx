"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function closeForm() {
    setIsOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus("idle");
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Unable to change your password.");

      setStatus("success");
      setMessage(data.message ?? "Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to change your password.");
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-blue-600" />
          Account security
        </CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => { setIsOpen((value) => !value); setStatus("idle"); setMessage(""); }}>
          {isOpen ? "Close" : "Change password"}
        </Button>
      </CardHeader>

      {isOpen && (
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>

            {message && (
              <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${status === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}>
                {status === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
              <Button type="submit" size="sm" disabled={status === "submitting"}>
                {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "submitting" ? "Changing..." : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
