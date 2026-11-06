import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-slate-200">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
              Error 403
            </div>
            <CardTitle className="text-2xl font-extrabold text-slate-900">
              Unauthorized Access
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">
              You do not have the required permissions or panel access to view
              this protected page.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <Button
            className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700 gap-2 shadow-sm"
            onClick={() => navigate("/welcome", { replace: true })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Welcome Page
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
