import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OverlayRoot } from '@/components/layout/OverlayRoot';

function PageFallback() {
  return (
    <main>
      <section className="hero" aria-busy="true">
        <div className="shell">
          <p className="sr-only">Loading page</p>
        </div>
      </section>
    </main>
  );
}

export function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }, 30);
      return;
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return (
    <>
      <Header />
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
      <Footer />
      <OverlayRoot />
    </>
  );
}
