"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export default function GoogleLogin() {
  return (
    <Button
      onClick={() => signIn("google")}
      className="w-full bg-slate-800 text-gray-300"
    >
      Continue with Google
    </Button>
  );
}

// export const LoginButton = () => {
//   return <button onClick={() => signIn()}>Sign in</button>
// }

// export const LogoutButton = () => {
//   return <button onClick={() => signOut()}>Sign Out</button>
// }
