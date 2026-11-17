import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/storeHooks";
import { Lock, KeyRound, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import {
  useCheckPanelAccessQuery,
  usePanelLoginMutation,
} from "@/features/admin/accountcreationPanel/services/panelAccessApi";

export const PanelAuthGuard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const userType = user?.userType?.toLowerCase() || "";
  const isAdmin = userType === "admin" || userType === "superadmin";

  const pathSegments = location.pathname.split("/");
  const detectedPanelName = pathSegments[2] || "general";

  const {
    data: accessCheck,
    isLoading: isCheckingAccess,
    refetch,
  } = useCheckPanelAccessQuery(detectedPanelName, {
    skip: isAdmin,
  });

  const [panelLogin, { isLoading: isLoggingIn }] = usePanelLoginMutation();

  if (!isAdmin && isCheckingAccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Verifying...</p>
        </div>
      </div>
    );
  }

  const isCookieUnlocked = accessCheck?.unlocked === true;

  // ২. অ্যাডমিন অথবা কুকি ভ্যালিড থাকলে সরাসরি চাইল্ড রেন্ডার করবে
  if (isAdmin || isCookieUnlocked) {
    return <Outlet />;
  }

  // ৩. পাসওয়ার্ড সাবমিট হ্যান্ডলার
  const handlePanelPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await panelLogin({
        panel: detectedPanelName,
        panelPassword: passwordInput,
      }).unwrap();

      if (res.success) {
        setPasswordInput("");
        await refetch();
      }
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message ||
          "Authentication failed: Invalid panel credentials.",
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg relative">
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-4 left-4 text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 capitalize">
            {detectedPanelName} Panel Protected
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the password assigned by the admin to access this panel.
          </p>
        </div>

        <form onSubmit={handlePanelPasswordSubmit} className="mt-6 space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="Enter Panel Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
                required
              />
            </div>
            {errorMsg && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {isLoggingIn ? "Verifying..." : "Unlock Panel"}
          </button>
        </form>
      </div>
    </div>
  );
};
