export const RESPONSIVE_BREAKPOINTS = {
  phone: 720,
  narrowPhone: 430,
  split: 980,
  desktop: 1280,
} as const;

export function getResponsiveFlags(width: number) {
  const isPhone = width < RESPONSIVE_BREAKPOINTS.phone;
  const isNarrowPhone = width < RESPONSIVE_BREAKPOINTS.narrowPhone;
  const isSplit = width >= RESPONSIVE_BREAKPOINTS.split;
  const isDesktop = width >= RESPONSIVE_BREAKPOINTS.desktop;
  const isTablet = !isPhone && !isDesktop;

  return {
    isPhone,
    isNarrowPhone,
    isTablet,
    isSplit,
    isDesktop,
  };
}
