import React from "react";
import { CTASection } from "@/components/landing/cta-section";
import { FeatureSection } from "@/components/landing/feature-section";
import HeroSection from "@/components/landing/hero-section";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PricingSection } from "@/components/landing/pricing-section";
import FeaturesCard from "@/components/landing/FeaturesCard";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <FeaturesCard />
      <FeatureSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
