import Navbar from '../components/layout/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/Landing/HowItWorks';
// import Testimonials from '../components/Landing/Testimonials';
// import CTA from '../components/Landing/CTA';
import Footer from '../components/Landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      {/* <Testimonials /> */}
      {/* <CTA /> */}
      <Footer />
    </div>
  );
};

export default LandingPage;





















