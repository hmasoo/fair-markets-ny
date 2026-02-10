import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-fm-sage mb-6">
      <Link href="/" className="hover:text-fm-teal transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-gray-300">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-fm-teal transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-fm-patina font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
