"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GoogleLogin from "@/components/google-login";
import { getSession, signIn } from "next-auth/react";
import path from "path";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    // Check if the user is logged in
    const checkSession = async () => {
      const session = await getSession();
      if (session && pathname !== "/admin") {
        router.push("/chat");
      }
    };

    checkSession();
  }, []);

  const loginUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        alert("Login failed");
      } else {
        alert("Logged in successfully");
        router.push(pathname === "/admin" ? "/admin" : "/chat");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-scree">
      <div className="p-6 space-y-8 bg-slate-900 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={loginUser} className="space-y-6">
          <label className="block text-sm font-medium">
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
          <label className="block text-sm font-medium">
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
          <Button
            type="submit"
            variant="outline"
            className="w-full px-3 py-2 text-white bg-slate-800 rounded hover:bg-slate-700"
          >
            Login
          </Button>
        </form>
        {pathname !== "/admin" && (
          <div className="flex flex-col gap-4 justify-center items-center">
            <h2>OR</h2>

            <GoogleLogin />
          </div>
        )}
        <div className="register text-center">
          <Link href="/register">
            Don&apos;t have an account?{" "}
            <span className="text-blue-600">Register</span>{" "}
          </Link>
        </div>
      </div>
    </div>
  );
}
