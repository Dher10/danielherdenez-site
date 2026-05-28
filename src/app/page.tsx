import Nav from '@/components/sections/nav';
import Hero from '@/components/sections/hero';
import Proof from '@/components/sections/proof';
import Work from '@/components/sections/work';
import About from '@/components/sections/about';
import Writing from '@/components/sections/writing';
import Footer from '@/components/sections/footer';

export const dynamic = 'force-static';

export default function Home() {
  return (
    <>
      <Nav />
      <span id="top" />
      <Hero />
      <Proof />
      <Work />
      <About />
      <Writing />
      <Footer />
    </>
  );
}
