import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  AudienceList,
  BenefitsGrid,
  FactorsSection,
  MidCtaBanner,
  ScienceSection,
} from "@/components/landing/ContentSections";
import { Hero, IntroBlocks } from "@/components/landing/Hero";
import { FloatingCta } from "@/components/landing/FloatingCta";
import {
  AboutSection,
  BrandAuthoritySection,
  DecisionSection,
  GuaranteeSection,
  TrustSection,
  WarningSection,
  WhySection,
} from "@/components/landing/MoreSections";
import { Pricing } from "@/components/landing/Pricing";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Testimonials } from "@/components/landing/Testimonials";
import { WhatsAppPrintsCarousel } from "@/components/landing/WhatsAppPrintsCarousel";
import { Faq } from "@/components/landing/Faq";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <main className="flex-1 pb-[calc(7rem+env(safe-area-inset-bottom,0px))]">
        <Hero />
        <IntroBlocks />
        <ScienceSection />
        <AudienceList />
        <FactorsSection />
        <BenefitsGrid />
        <MidCtaBanner />
        <Testimonials />
        <WhatsAppPrintsCarousel />
        <WhySection />
        <GuaranteeSection />
        <Suspense
          fallback={<div className="min-h-[36rem] w-full" aria-busy="true" />}
        >
          <Pricing />
        </Suspense>
        <DecisionSection />
        <AboutSection />
        <BrandAuthoritySection />
        <WarningSection />
        <TrustSection />
        <Faq />
        <SiteFooter />
      </main>
      <FloatingCta />
    </>
  );
}
