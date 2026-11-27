import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SEO } from '../components/SEO';

const mockUseRouter = vi.fn();

vi.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

describe('SEO component', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      asPath: '/',
    });
  });

  it('renders complete Open Graph and Twitter Card tags with defaults', () => {
    render(<SEO />);

    // Title & Description
    expect(document.title).toBe('DSA Study Hub');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'The ultimate platform to learn DSA with interactive visualizations, roadmaps, and practice questions.'
    );

    // Canonical
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://dsa-study-hub.vercel.app/'
    );

    // Open Graph
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website');
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe('DSA Study Hub');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('DSA Study Hub');
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      'The ultimate platform to learn DSA with interactive visualizations, roadmaps, and practice questions.'
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/'
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/screenshots/Home.png'
    );
    expect(document.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/screenshots/Home.png'
    );
    expect(document.querySelector('meta[property="og:image:type"]')?.getAttribute('content')).toBe('image/png');
    expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')).toBe('1912');
    expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')).toBe('951');
    expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBe(
      'DSA Study Hub - Interactive Data Structures & Algorithms'
    );

    // Twitter Card
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('DSA Study Hub');
    expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe(
      'The ultimate platform to learn DSA with interactive visualizations, roadmaps, and practice questions.'
    );
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/screenshots/Home.png'
    );
    expect(document.querySelector('meta[name="twitter:image:alt"]')?.getAttribute('content')).toBe(
      'DSA Study Hub - Interactive Data Structures & Algorithms'
    );

    // Robots
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
  });

  it('formats custom page title and description correctly', () => {
    mockUseRouter.mockReturnValue({
      asPath: '/sorting?filter=bubble',
    });

    render(
      <SEO 
        title="Sorting Algorithms Visualizer" 
        description="Visualize sorting algorithms in real time."
      />
    );

    expect(document.title).toBe('Sorting Algorithms Visualizer | DSA Study Hub');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Sorting Algorithms Visualizer | DSA Study Hub'
    );
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(
      'Sorting Algorithms Visualizer | DSA Study Hub'
    );
    // Strips query parameters from canonical and og:url
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://dsa-study-hub.vercel.app/sorting'
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/sorting'
    );
  });

  it('supports custom images, dimensions, types, article mode, and noindex', () => {
    mockUseRouter.mockReturnValue({
      asPath: '/program/123',
    });

    render(
      <SEO 
        title="Binary Search"
        description="Learn Binary Search in O(log n) time."
        image="/screenshots/Program.png"
        imageWidth={1200}
        imageHeight={630}
        imageType="image/png"
        imageAlt="Binary Search Diagram"
        article
        noindex
      />
    );

    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/screenshots/Program.png'
    );
    expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')).toBe('1200');
    expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')).toBe('630');
    expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBe(
      'Binary Search Diagram'
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('supports absolute image URLs and auto-infers JPEG type', () => {
    render(
      <SEO 
        image="https://dsa-study-hub.vercel.app/custom-image.jpg"
        canonicalUrl="https://dsa-study-hub.vercel.app/custom"
      />
    );

    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://dsa-study-hub.vercel.app/custom-image.jpg'
    );
    expect(document.querySelector('meta[property="og:image:type"]')?.getAttribute('content')).toBe('image/jpeg');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://dsa-study-hub.vercel.app/custom'
    );
  });
});
