import { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { fetchFreelancers } from "@/lib/freelancerView";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import WhySection from "@/components/landing/WhySection";
import FindFreelance from "@/components/landing/FindFreelance";
import TopFreelancers from "@/components/landing/TopFreelancers";
import FindMission from "@/components/landing/FindMission";
import AfricaWorld from "@/components/landing/AfricaWorld";
import Journeys from "@/components/landing/Journeys";
import BusinessSection from "@/components/landing/BusinessSection";
import Matching from "@/components/landing/Matching";
import Trust from "@/components/landing/Trust";
import Testimonials from "@/components/landing/Testimonials";
import WhyAfrica from "@/components/landing/WhyAfrica";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Landing() {
  const [top, setTop] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [fls, prs] = await Promise.all([
        fetchFreelancers({ limit: 4, sort: "-updated_date" }).catch(() => []),
        api.entities.Project.filter({ status: "published" }, "-created_date", 6).catch(() => []),
      ]);
      if (!alive) return;
      setTop(fls);
      setProjects(prs);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <Hero />
      <SocialProof />
      <WhySection />
      <FindFreelance />
      <TopFreelancers freelancers={top} loading={loading} />
      <FindMission projects={projects} loading={loading} />
      <AfricaWorld />
      <Journeys />
      <BusinessSection />
      <Matching />
      <Trust />
      <Testimonials />
      <WhyAfrica />
      <FinalCTA />
    </div>
  );
}