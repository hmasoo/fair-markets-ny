import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-fm-patina text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Fair Markets NY</h3>
            <p className="text-sm leading-relaxed">
              Tracking market concentration, corporate consolidation, and their impact on
              affordability across New York State.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Research Areas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/housing" className="hover:text-white transition-colors">Housing</Link></li>
              <li><Link href="/broadband" className="hover:text-white transition-colors">Broadband</Link></li>
              <li><Link href="/healthcare" className="hover:text-white transition-colors">Healthcare</Link></li>
              <li><Link href="/enforcement" className="hover:text-white transition-colors">Enforcement Tracker</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">Methodology</Link></li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Source Code
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-sm text-center">
          All data sourced from federal, state, and city government public records.
        </div>
      </div>
    </footer>
  );
}
