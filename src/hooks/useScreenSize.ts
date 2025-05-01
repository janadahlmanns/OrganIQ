import { useEffect, useState } from 'react';

export function useScreenSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isWide: width >= 640,        // sm and up = 1x10
    isMedium: width >= 320 && width < 640, // xs only = 2x5
    isNarrow: width < 320        // below xs = 5x2
  };
}
