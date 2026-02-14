import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-fm-patina text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Fair Markets NY</h3>
            <p className="text-sm leading-relaxed">
              Public data on market competition and ownership structure across
              New York State — housing, broadband, healthcare, and more.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Research Areas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/housing" className="hover:text-white transition-colors">Housing</Link></li>
              <li><Link href="/broadband" className="hover:text-white transition-colors">Broadband</Link></li>
              <li><Link href="/healthcare" className="hover:text-white transition-colors">Healthcare</Link></li>
              <li><Link href="/transportation" className="hover:text-white transition-colors">Transportation</Link></li>
              <li><Link href="/enforcement" className="hover:text-white transition-colors">Regulatory Tracker</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">How to Read the Data</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/about#methodology" className="hover:text-white transition-colors">Methodology</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-sm text-center space-y-1">
          <div>Built from public government records and published research. <Link href="/about#data-sources" className="underline hover:text-white">See all sources.</Link></div>
          <div className="text-xs text-white/40 font-mono">
            Published {process.env.NEXT_PUBLIC_BUILD_DATE} · {process.env.NEXT_PUBLIC_GIT_SHA}
          </div>
        </div>
      </div>
    </footer>
  );
}
