"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const { error } = await signIn.email({ email, password });
    if (error) {
      setIsLoading(false);
      toast.error("Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.");
      return;
    }
    toast.success("Đăng nhập thành công.");
    // Giữ spinner tới khi chuyển trang xong, không bật lại form
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-background">
      <Card className="w-full max-w-[calc(100%-2rem)] sm:max-w-sm shadow-xs">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-wide">ZENBOARD</CardTitle>
            <CardDescription className="text-xs">Đăng nhập để quản lý nhà trọ</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" className="w-full text-xs" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
