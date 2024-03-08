"use client"
import { useTheme } from "next-themes";
import darkLogo from "../images/logo.svg";
import lightLogo from "../images/logolight.svg";
import Link from "next/link";
import Image from "next/image";

export function Logo({
  height = "32",
  width = "32",
}: {
  height?: string;
  width?: string;
}) {
  const { theme } = useTheme();
  const logo = theme === "dark" ? darkLogo : lightLogo;

  return (
    <Image src={logo} width={240} height={240} alt="logo" />
  );
}

export function NamedLogoWithLink() {
  return (
    <Link href="/" className="flex flex-row items-center gap-3">
      <Logo height="32" width="32" />
      <h3 className="font-semibold text-lg"></h3>
    </Link>
  );
}
