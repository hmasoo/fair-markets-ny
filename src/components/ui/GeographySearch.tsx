"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  name: string;
  slug: string;
  group?: string;
}

interface GeographySearchProps {
  items: SearchItem[];
  basePath: string;
  placeholder?: string;
}

export function GeographySearch({
  items,
  basePath,
  placeholder = "Search...",
}: GeographySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered =
    query.length > 0
      ? items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              (item.group?.toLowerCase().includes(query.toLowerCase()) ?? false),
          )
          .slice(0, 8)
      : [];

  const showDropdown = open && filtered.length > 0;

  useEffect(() => {
    if (showDropdown && listRef.current) {
      const el = listRef.current.children[activeIndex] as
        | HTMLElement
        | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, showDropdown]);

  function navigate(slug: string) {
    setQuery("");
    setOpen(false);
    router.push(`${basePath}/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(filtered[activeIndex].slug);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative max-w-md">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-expanded={showDropdown}
        aria-controls="geo-search-listbox"
        aria-autocomplete="list"
        role="combobox"
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-fm-patina placeholder:text-fm-sage/60 focus:outline-none focus:ring-2 focus:ring-fm-teal/30 focus:border-fm-teal"
      />
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-fm-sage/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {showDropdown && (
        <ul
          id="geo-search-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-auto max-h-64"
        >
          {filtered.map((item, i) => (
            <li
              key={item.slug}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => navigate(item.slug)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer ${
                i === activeIndex
                  ? "bg-fm-teal/10 text-fm-patina"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{item.name}</span>
              {item.group && (
                <span className="text-fm-sage ml-2 text-xs">{item.group}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
