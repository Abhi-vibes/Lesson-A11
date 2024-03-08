"use client";
// pages/register.tsx
import { useState } from "react";
import { useRouter } from "next/navigation"; // Corrected import
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Added state for name
  const router = useRouter();

  const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const result = await res.json();

      // const result = await res.json();
      if (res.ok) {
        alert("Registration successful");
        router.push("/login");
      } else {
        alert(result.message || "Registration failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-scree">
      <div className="p-6 space-y-8 bg-slate-900 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold">Register</h1>
        <form onSubmit={registerUser} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <Button
            variant="outline"
            type="submit"
            className="w-full px-3 py-2 text-white bg-slate-800 rounded hover:bg-slate-700"
          >
            Register
          </Button>
        </form>
        <div className="login text-center">
          <Link href="/login">Already have an account? <span className="text-blue-600">Login</span> </Link>
        </div>
      </div>
    </div>
  );
}
