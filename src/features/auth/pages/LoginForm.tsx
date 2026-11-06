import TurnstileWidget from "@/components/common/TurnstileWidget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useLoginForm } from "../hooks/useLoginForm";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    generalError,
    setTurnstileToken,
    turnstileWidgetKey,
    TURNSTILE_SITE_KEY,
  } = useLoginForm();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md">
            AD
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Secure login with Zod validation & Turnstile protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {generalError && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300 text-center">
                {generalError}
              </div>
            )}

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="017XXXXXXXX"
                {...register("phone")}
                className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
              />
              {errors.phone && (
                <p className="text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="border-zinc-700 bg-zinc-950 text-white focus-visible:ring-indigo-500"
              />
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center py-1">
                <TurnstileWidget
                  key={turnstileWidgetKey}
                  siteKey={TURNSTILE_SITE_KEY}
                  action="admin_login"
                  onVerify={(token: string) => setTurnstileToken(token)}
                  onSuccess={(token: string) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500">
            Restricted System. Authorized personnel only. <br />
            Need access? Please contact HR.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
