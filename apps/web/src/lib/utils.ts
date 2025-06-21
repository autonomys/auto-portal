import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (addr?: string, length = 4) => {
  if (!addr) return "";
  return `${addr.slice(0, length + 2)}…${addr.slice(-length)}`;
};
