import { useState, useEffect } from 'react';

export const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mobileQuery = window.matchMedia('(max-width: 768px)');
        const desktopQuery = window.matchMedia('(min-width: 1024px)');

        const updateMatches = () => {
            setIsMobile(mobileQuery.matches);
            setIsDesktop(desktopQuery.matches);
        };

        // Initial check
        updateMatches();

        // Listeners
        mobileQuery.addEventListener('change', updateMatches);
        desktopQuery.addEventListener('change', updateMatches);

        return () => {
            mobileQuery.removeEventListener('change', updateMatches);
            desktopQuery.removeEventListener('change', updateMatches);
        };
    }, []);

    return { isMobile, isDesktop };
};
