import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label} ago`;
  }
  return "just now";
}

export const STATUS_CONFIG = {
  under_review: { label: "Under Review", color: "var(--idea-pending)", dotClass: "bg-slate-400" },
  planned: { label: "Coming Soon", color: "var(--idea-planned)", dotClass: "bg-blue-500" },
  in_progress: { label: "In Development", color: "var(--idea-building)", dotClass: "bg-purple-600" },
  shipped: { label: "Now Available", color: "var(--idea-shipped)", dotClass: "bg-emerald-500" },
  declined: { label: "Not Planned", color: "var(--idea-declined)", dotClass: "bg-red-400" },
} as const;

export type Status = keyof typeof STATUS_CONFIG;
