"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "Landing" },
  { href: "/activate", label: "Activate" },
  { href: "/choose-path", label: "Choose" },
  { href: "/app/welcome", label: "App:Hi" },
  { href: "/app/user-type", label: "App:Type" },
  { href: "/app/confirm-product", label: "App:Prod" },
  { href: "/app/quantity", label: "App:Qty" },
  { href: "/app/notifications", label: "App:Notif" },
  { href: "/app/dashboard", label: "App:Dash" },
  { href: "/web/start", label: "Web:Start" },
  { href: "/web/check-email", label: "Web:Email" },
  { href: "/web/dashboard", label: "Web:Dash" },
  { href: "/reorder", label: "Reorder" },
  { href: "/reorder/success", label: "Success" },
];

export default function PrototypeNav() {
  return null;
}
