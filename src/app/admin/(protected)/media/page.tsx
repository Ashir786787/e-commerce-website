"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  LinkIcon,
  Copy,
  Check,
  Trash2,
  ImagePlus,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";

interface MediaItem {
  _id: string;
  url: string;
  publicId?: string;
  filename: string;
  createdAt: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [filenameInput, setFilenameInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await api.get("/admin/media");
      setMedia(res.data.data);
    } catch {
      toast.error("Failed to load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, GIF or AVIF images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      const res = await api.post("/admin/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newItem = res.data.data;
      setMedia((prev) => [newItem, ...prev]);
      toast.success("Image uploaded successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter an image URL.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.post("/admin/media", {
        url: urlInput.trim(),
        filename: filenameInput.trim() || undefined,
      });

      const newItem = res.data.data;
      setMedia((prev) => [newItem, ...prev]);
      setUrlInput("");
      setFilenameInput("");
      toast.success("Image URL saved.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save URL.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item._id);
      toast.success("URL copied to clipboard.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL.");
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/admin/media/${item._id}`);
      setMedia((prev) => prev.filter((m) => m._id !== item._id));
      toast.success("Image deleted.");
    } catch {
      toast.error("Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMedia = media.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-950">Media Library</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload images or add external URLs. Uploaded images are stored on Cloudinary.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex gap-1 rounded-xl bg-neutral-100 p-1">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === "upload"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("url")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === "url"
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                Add URL
              </button>
            </div>

            {activeTab === "upload" ? (
              <div
                ref={dragRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-neutral-300 hover:border-indigo-400 hover:bg-indigo-50/50"
                }`}
              >
                {uploading ? (
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-indigo-500" />
                ) : (
                  <ImagePlus className="mb-3 h-8 w-8 text-neutral-400" />
                )}
                <p className="text-sm font-medium text-neutral-700">
                  {uploading ? "Uploading..." : "Click or drag an image here"}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  JPG, PNG, WEBP, GIF, AVIF — max 4MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Filename <span className="text-neutral-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={filenameInput}
                    onChange={(e) => setFilenameInput(e.target.value)}
                    placeholder="my-image"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  onClick={handleUrlSubmit}
                  disabled={uploading || !urlInput.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  Save URL
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">{media.length}</span> images in library
            </p>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or URL..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-neutral-100" />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-16">
              <ImagePlus className="mb-3 h-10 w-10 text-neutral-300" />
              <p className="text-sm text-neutral-500">
                {searchQuery ? "No images match your search." : "No images uploaded yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredMedia.map((item) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-neutral-50">
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-colors group-hover:bg-black/40">
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-neutral-700 opacity-0 shadow-lg transition-all hover:bg-white group-hover:opacity-100"
                      title="Copy URL"
                    >
                      {copiedId === item._id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item._id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-red-600 opacity-0 shadow-lg transition-all hover:bg-white group-hover:opacity-100 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="px-3 py-2">
                    <p className="truncate text-xs font-medium text-neutral-700" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-neutral-400" title={item.url}>
                      {item.url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
