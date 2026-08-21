"use client";

import { useEffect, useRef, useState } from "react";
import { Search, UserPlus, X, Loader2 } from "lucide-react";

interface UserPickerUser {
  _id: string;
  fullName: string;
  email: string;
}

interface UserPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: UserPickerUser) => void;
}

export default function UserPickerDialog({ isOpen, onClose, onSelect }: UserPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserPickerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setUsers([]);
      setPage(1);
      return;
    }
    searchInputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/admin/users?${params}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data);
          setTotalPages(data.pagination.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, page, search]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, 300);
  }

  function handleSelect(user: UserPickerUser) {
    onSelect(user);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl" style={{ maxHeight: "80vh" }}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">Start New Chat</h2>
              <p className="text-sm text-neutral-500">Select a user to message</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-neutral-100 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-500">
                {search.trim() ? "No users found matching your search." : "No users available."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-indigo-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-950">{user.fullName}</p>
                    <p className="mt-0.5 truncate text-sm text-neutral-500">{user.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition group-hover:bg-indigo-100">
                    Chat
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-neutral-200 px-6 py-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
