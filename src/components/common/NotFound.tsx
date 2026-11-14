import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50/50 px-4 py-12">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
        {/* Top Icon Badge */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50 shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>

        {/* 404 Tag */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100/80 text-indigo-700 mb-3">
          Error 404
        </span>

        {/* Main Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been removed, changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button className="w-full sm:w-auto gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
