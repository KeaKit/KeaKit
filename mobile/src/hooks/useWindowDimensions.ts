import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { navbarBreakpoint } from '../components/HeaderNavbar';

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  return dimensions;
};

export const useNavbarOffset = () => {
  const MOBILE_BREAKPOINT = navbarBreakpoint;
  const { width } = useWindowDimensions();
  return width < MOBILE_BREAKPOINT ? 86 : 0;
};