import ReportIssue from '../src/components/ReportIssue';
import { SEO } from '../src/components/SEO';

export default function ReportPage() {
  return (
    <>
      <SEO 
        title="Report an Issue" 
        description="Submit bugs, issues, or suggestions to improve DSA Study Hub." 
      />
      <section className="pt-32 pb-20 px-4 min-h-screen">
        <ReportIssue />
      </section>
    </>
  );
}
