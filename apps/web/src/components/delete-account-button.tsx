"use client";

import { AlertOctagon } from "lucide-react";

export default function DeleteAccountButton() {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      // For now, this just alerts. You would hook this up to a server action.
      alert("Account deletion triggered. (Not fully implemented yet)");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <AlertOctagon size={16} className="text-red-600" />
        <h2 className="text-sm font-bold text-red-600">Danger Zone</h2>
      </div>
      <p className="text-xs text-[#64748B] mb-5">Permanently delete your account and all associated tracker data. This action cannot be undone.</p>
      <button 
        type="button" 
        onClick={handleDelete}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 font-bold text-xs rounded-xl hover:bg-red-100 hover:border-red-300 transition-all min-h-0 w-full justify-center sm:w-auto"
      >
        Delete Account
      </button>
    </div>
  );
}
