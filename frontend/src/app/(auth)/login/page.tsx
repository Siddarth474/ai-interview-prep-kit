"use client";

import React from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogin } from "../../../hooks/useLogin";

export default function LoginPage() {
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    handleSubmit,
  } = useLogin();

  return (
    <Card className="border border-white/10 bg-white/3 backdrop-blur-xl shadow-2xl rounded-2xl ring-0 text-white">
      <CardHeader className="space-y-1.5 text-center pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-white/50">
          Enter your email or username to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 animate-in fade-in duration-200"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="identifier"
              className="text-xs font-medium text-white/80"
            >
              Email or Username
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="name@example.com or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
              disabled={isLoading}
              className="h-10 bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-white/80"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-white/50 hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-10 pr-10 bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 mt-2 bg-white hover:bg-white/90 text-[#090b0b]! font-semibold shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2.2} />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="pt-2 pb-6 flex justify-center border-t border-white/8 mt-4">
          <p className="text-xs text-white/50">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-white underline-offset-4 hover:underline transition-colors"
            >
              Create one now
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
