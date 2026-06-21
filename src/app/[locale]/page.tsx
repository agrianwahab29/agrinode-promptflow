import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FeaturesBento } from '@/components/landing/features-bento';
import { ProductDemo } from '@/components/landing/product-demo';
import { Testimonials } from '@/components/landing/testimonials';
import { Faq } from '@/components/landing/faq';
import { FinalCta } from '@/components/landing/final-cta';
import { Footer } from '@/components/landing/footer';
import { ScrollTracker } from '@/components/landing/scroll-tracker';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollTracker />
      <Navbar />
      <main>
        <Hero />
        <SocialProofBar />
        <ProblemSolution />
        <HowItWorks />
        <FeaturesBento />
        <ProductDemo />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
