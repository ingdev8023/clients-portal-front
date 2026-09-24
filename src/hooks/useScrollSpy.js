import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const handleScroll = () => {
      let nextSection = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && window.scrollY >= element.offsetTop - 150) nextSection = id;
      }
      setActiveSection(nextSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  return activeSection;
}
