type Variant = "default" | "red" | "blue" | "green" | "yellow" | "gray";

// Colorblind-safe badge colors: blue (low/good), amber (moderate), vermillion (high/bad)
const variants: Record<Variant, string> = {
  default: "bg-fm-patina/10 text-fm-patina",
  red: "bg-orange-100 text-orange-900",
  blue: "bg-sky-100 text-sky-800",
  green: "bg-sky-50 text-sky-700",
  yellow: "bg-amber-100 text-amber-900",
  gray: "bg-gray-100 text-gray-700",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
