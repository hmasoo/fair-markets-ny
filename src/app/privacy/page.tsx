import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fair Markets NY handles visitor privacy. No cookies, no personal data, no tracking.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />

      <h1 className="text-3xl font-bold text-fm-patina mb-6">
        Privacy Policy
      </h1>

      <div className="space-y-8">
        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            What We Collect
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Fair Markets NY uses two cookieless, anonymous services provided
              by Vercel:
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>
                <strong>Vercel Analytics</strong> — anonymous pageview counts,
                country-level geolocation, referrer domain, device type, and
                browser. No cookies are set, and no personally identifiable
                information is collected.
              </li>
              <li>
                <strong>Vercel Speed Insights</strong> — Core Web Vitals
                performance metrics (loading time, interactivity, visual
                stability). These measurements are anonymous and contain no
                user-level data.
              </li>
            </ul>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            What We Don{"'"}t Collect
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <ul className="space-y-2 ml-4 list-disc">
              <li>No personal information (names, emails, IP addresses)</li>
              <li>No user accounts or login systems</li>
              <li>No cookies or local storage tracking</li>
              <li>No advertising trackers or pixels</li>
              <li>No cross-site tracking</li>
              <li>No fingerprinting</li>
            </ul>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Government Data Sources
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              All data displayed on this site comes from public government
              sources — federal agencies, New York State, and New York City open
              data portals. We aggregate and present this data for public
              understanding of market structure. We do not collect, store, or
              display data about individual people.
            </p>
            <p>
              For a full list of sources and legal basis, see{" "}
              <a href="/about" className="text-fm-teal hover:underline">
                how to read this data
              </a>
              .
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Third-Party Services
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              <strong>Vercel</strong> — This site is hosted on Vercel, which
              provides the analytics and performance monitoring described above.
              Vercel{"'"}s analytics are cookieless and GDPR-compliant by
              default. See{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel{"'"}s Privacy Policy
              </a>{" "}
              for details.
            </p>
            <p>
              <strong>Fonts</strong> — All fonts are self-hosted via{" "}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                next/font
              </code>
              . No requests are made to Google Fonts or other external font
              services.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">Contact</h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              If you have questions about this privacy policy, email{" "}
              <a
                href="mailto:hello@masoo.co"
                className="text-fm-teal hover:underline"
              >
                hello@masoo.co
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
