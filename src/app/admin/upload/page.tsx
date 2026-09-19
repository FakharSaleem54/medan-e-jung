"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExtractedPlayer = {
  name: string;
  kills: number;
  deaths: number;
  kd?: number;
  confidence: number;
};

type ExtractedMatch = {
  mode: string;
  players: ExtractedPlayer[];
};

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedMatch | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/matches/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setExtractedData(result.data);
      } else {
        alert("Failed to extract data: " + result.error);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Network or Server Error during extraction:\n\n${msg}\n\nThis usually happens if the server times out (takes longer than 10s) or the image is too large.`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlayerChange = (index: number, field: keyof ExtractedPlayer, value: string) => {
    if (!extractedData) return;
    const updated = [...extractedData.players];
    const player = { ...updated[index] };

    if (field === "name") {
      player.name = value;
    } else if (field === "kills") {
      player.kills = Number(value) || 0;
      player.kd = player.deaths > 0 ? player.kills / player.deaths : player.kills;
    } else if (field === "deaths") {
      player.deaths = Number(value) || 0;
      player.kd = player.deaths > 0 ? player.kills / player.deaths : player.kills;
    }

    updated[index] = player;
    setExtractedData({ ...extractedData, players: updated });
  };

  const handleSave = async () => {
    if (!extractedData) return;
    setSaving(true);

    try {
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: extractedData.mode,
          players: extractedData.players,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        alert("Failed to save: " + result.error);
      }
    } catch {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Scorecard</h1>

      {!extractedData ? (
        <form onSubmit={handleUpload} className="glass-panel p-8 flex flex-col gap-6 items-center">
          <div
            className="w-full max-w-md border-2 border-dashed border-glass-border p-12 text-center rounded-xl hover:border-gaming-accent transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">📤</div>
            <p className="text-gray-400">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, WebP up to 10MB</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/png,image/jpg,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {file && (
            <div className="text-gaming-accent text-sm">
              ✅ Selected: {file.name}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || processing}
            className="bg-gaming-accent text-white px-8 py-3 rounded font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {processing ? "🤖 AI Extracting..." : "Extract Data with AI"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel p-6 border-l-4 border-gaming-accent">
            <h2 className="text-xl font-bold mb-2">Verify Extraction</h2>
            <p className="text-sm text-gray-400 mb-4">
              Review and correct any mistakes before saving. K/D is calculated automatically from Kills/Deaths.
            </p>

            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-1">Match Mode</label>
              <input
                type="text"
                value={extractedData.mode}
                onChange={(e) => setExtractedData({ ...extractedData, mode: e.target.value })}
                className="bg-black/30 border border-glass-border p-2 rounded w-full max-w-xs focus:border-gaming-accent outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/30 text-gray-400 text-sm">
                  <tr>
                    <th className="p-3">Player Name</th>
                    <th className="p-3 w-28">Kills</th>
                    <th className="p-3 w-28">Deaths</th>
                    <th className="p-3 w-20">K/D</th>
                    <th className="p-3 w-24">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {extractedData.players.map((p, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePlayerChange(i, "name", e.target.value)}
                          className="bg-black/30 border border-glass-border p-2 rounded w-full focus:border-gaming-accent outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={p.kills}
                          onChange={(e) => handlePlayerChange(i, "kills", e.target.value)}
                          className="bg-black/30 border border-glass-border p-2 rounded w-full focus:border-gaming-accent outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={p.deaths}
                          onChange={(e) => handlePlayerChange(i, "deaths", e.target.value)}
                          className="bg-black/30 border border-glass-border p-2 rounded w-full focus:border-gaming-accent outline-none"
                        />
                      </td>
                      <td className="p-3 font-mono text-gray-400">
                        {(p.deaths > 0 ? p.kills / p.deaths : p.kills).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className={p.confidence > 90 ? "text-green-400" : "text-orange-400"}>
                          {p.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gaming-accent text-white px-6 py-3 rounded font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "✅ Confirm & Save Match"}
            </button>
            <button
              onClick={() => setExtractedData(null)}
              className="bg-transparent border border-glass-border text-white px-6 py-3 rounded font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
