import PageHeader from '../components/layout/PageHeader'

export default function About() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="About" subtitle="Project background and data methodology" />

      <div className="space-y-6">
        <section className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
          <h3 className="font-serif text-xl mb-3">LemonTree Insights</h3>
          <p className="text-sm text-lt-text leading-relaxed">
            LemonTree Insights is a data visualization and reporting dashboard built for the
            Morgan Stanley Code to Give Hackathon (Track B). It transforms food access data into
            clear, actionable insights for food banks, donors, and government agencies.
          </p>
          <p className="text-sm text-lt-text leading-relaxed mt-3">
            Lemontree is a nonprofit platform that helps people navigate local food resources and
            collects critical information about how well those resources meet community needs.
            This dashboard demonstrates how that data can be organized, visualized, and shared
            to improve the food access experience.
          </p>
        </section>

        <section className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
          <h3 className="font-serif text-xl mb-3">Data Sources</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <strong>NYC Emergency Food Supply Gap</strong> - Neighborhood-level supply gap analysis
              showing unmet food demand across 197 neighborhoods (2022-2025).
              <span className="block text-lt-text-secondary">Source: NYC Open Data (data.cityofnewyork.us)</span>
            </li>
            <li>
              <strong>Community Food Connection Quarterly Report</strong> - Quarterly data on individuals
              served by food pantries and meals served by soup kitchens (2011-2025).
              <span className="block text-lt-text-secondary">Source: NYC Open Data</span>
            </li>
            <li>
              <strong>SNAP Centers</strong> - Locations of all 13 SNAP (food stamp) enrollment centers in NYC.
              <span className="block text-lt-text-secondary">Source: NYC Open Data</span>
            </li>
            <li>
              <strong>NYC Farmers Markets</strong> - All registered farmers markets with hours, EBT acceptance,
              and location data.
              <span className="block text-lt-text-secondary">Source: NYC Open Data</span>
            </li>
            <li>
              <strong>US Census ACS (2022)</strong> - Borough-level poverty rates, median income, and population data.
              <span className="block text-lt-text-secondary">Source: American Community Survey 5-Year Estimates</span>
            </li>
          </ul>
        </section>

        <section className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
          <h3 className="font-serif text-xl mb-3">Methodology</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Synthetic Feedback:</strong> Since Lemontree's real user feedback is not publicly available,
              we generate realistic synthetic feedback using seeded randomization. The feedback is modeled
              after real food pantry reviews and covers categories like wait times, food quality, staff interactions,
              hours of operation, accessibility, and variety.
            </li>
            <li>
              <strong>NLP Processing:</strong> User-submitted feedback is automatically analyzed using TextBlob
              for sentiment analysis and keyword-based categorization to detect issue types.
            </li>
            <li>
              <strong>Supply Gap:</strong> A positive supply_gap_lbs value indicates unmet demand -- the neighborhood
              needs more food than it currently receives. The weighted_score combines food insecurity rates,
              unemployment, and vulnerable population data into a single need metric.
            </li>
          </ul>
        </section>

        <section className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
          <h3 className="font-serif text-xl mb-3">Extensibility</h3>
          <p className="text-sm text-lt-text leading-relaxed">
            This architecture is designed to integrate directly with Lemontree's real API when available.
            The backend's data fetching layer can be extended to pull from Lemontree's endpoints, replacing
            synthetic data with live community feedback. Additional data layers (USDA Food Access Research Atlas,
            NYC DOHMH neighborhood health indicators) can be added to provide even deeper context for
            understanding food access patterns.
          </p>
        </section>

        <section className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
          <h3 className="font-serif text-xl mb-3">Credits</h3>
          <p className="text-sm text-lt-text-secondary">
            Built for the Morgan Stanley Code to Give Hackathon 2026.
            Data provided by NYC Open Data and the U.S. Census Bureau.
            Created in partnership with Lemontree.
          </p>
        </section>
      </div>
    </div>
  )
}
