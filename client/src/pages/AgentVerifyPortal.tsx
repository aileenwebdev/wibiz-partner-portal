/**
 * AgentVerifyPortal.tsx
 * Token-gated identity verification. URL: /agent-verify?token=XXX
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { trpc } from "../lib/trpc";

export default function AgentVerifyPortal() {
  const [params]      = useSearchParams();
  const token         = params.get("token") ?? "";
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");

  const { data: session, isLoading, error: sessionError } = trpc.agentVerification.getSession.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const submitDoc = trpc.agentVerification.submitDocument.useMutation({
    onSuccess: () => setDone(true),
    onError:   (err) => setError(err.message),
  });

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      // Upload directly to Cloudinary using unsigned upload preset
      const cloudName    = __CLOUDINARY_CLOUD_NAME__;
      const uploadPreset = __CLOUDINARY_UPLOAD_PRESET__;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      fd.append("folder", "wibiz_id_verification");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: fd }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error((body.error as { message?: string })?.message ?? "Cloudinary upload failed");
      }

      const data = await res.json() as { secure_url: string };
      await submitDoc.mutateAsync({ token, documentUrl: data.secure_url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!token) return <ErrorPage message="Invalid verification link." />;
  if (isLoading) return <LoadingPage />;
  if (sessionError) return <ErrorPage message="This link is invalid or has expired." />;
  if (session?.status === "submitted" || done) {
    return (
      <SuccessPage message="Your ID has been submitted. Our team will review it shortly." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full">
        <h1 className="text-xl font-semibold mb-1">Identity Verification</h1>
        <p className="text-sm text-gray-500 mb-6">
          Agent <span className="font-mono text-orange-600">{session?.repCode}</span> · Please upload a clear photo of your government-issued ID.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {file ? (
              <p className="text-sm text-gray-700">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-400">Driver's license, passport, or state ID</p>
            )}
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-3 text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-orange-500 text-white py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Submit Document"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  );
}

function SuccessPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
