import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, LogOut, ShieldCheck, UserCheck } from "lucide-react";
import { RootState } from "@/app/store";
import { logout } from "@/features/auth/authThunk";

export const Welcome: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-6">
      <Card className="w-full max-w-xl shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
            <UserCheck className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold text-slate-900">
              Welcome back, {user?.fullName || user?.userName || "Valued User"}!
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">
              You are successfully authenticated to RPR DUET Admission Care
              System.
            </CardDescription>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <Badge
              variant="secondary"
              className="capitalize px-3 py-1 bg-blue-50 text-blue-700 font-semibold"
            >
              Role: {user?.userType || "User"}
            </Badge>
            {user?.isActive && (
              <Badge
                variant="default"
                className="bg-emerald-600 text-white font-semibold"
              >
                Active Account
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                User ID
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {user?.userId || "N/A"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Phone
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {user?.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              className="w-full sm:w-auto bg-blue-600 font-bold text-white hover:bg-blue-700 gap-2 shadow-sm"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
