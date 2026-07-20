import type { ComponentPropsWithoutRef } from "react";
import { filterControlClass } from "./constants";

export function filterControlClasses(className?: string) {
  return className ? `${filterControlClass} ${className}` : filterControlClass;
}

export default function FilterButton({ className, ...props }: ComponentPropsWithoutRef<"button">) {
  return <button className={filterControlClasses(className)} {...props} />;
}
