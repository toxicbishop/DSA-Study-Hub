import { CookiesView } from '../src/views/CookiesView';
import { SEO } from '../src/components/SEO';

export default function CookiesPage() {
  return (
    <>
      <SEO 
        title="Cookie Policy" 
        description="Learn how DSA Study Hub uses cookies and your options regarding them." 
      />
      <section className="pt-32 pb-20 px-4 min-h-screen">
        <CookiesView />
      </section>
    </>
  );
}
