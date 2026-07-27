import HeroSection from '@/components/public/HeroSection';
import EventsSection from '@/components/public/EventsSection';
import MenuPreviewSection from '@/components/public/MenuPreviewSection';
import SocialGallery from '@/components/public/SocialGallery';
import ReservationSection from '@/components/public/ReservationSection';
import Reveal from '@/components/ui/Reveal';

export default function Home() {
  return (
    <>
      <HeroSection />
      <Reveal variant="fade-in" delay={100}>
        <EventsSection />
      </Reveal>
      <Reveal variant="fade-in" delay={200}>
        <MenuPreviewSection />
      </Reveal>
      <Reveal variant="fade-in" delay={150}>
        <SocialGallery />
      </Reveal>
      <Reveal variant="fade-in" delay={200}>
        <ReservationSection />
      </Reveal>
    </>
  );
}