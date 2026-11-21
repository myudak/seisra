/** A nav item is active for its whole section, e.g. /config/* or /origin-locator-view/*. */
export const isNavActive = (menuPath: string, currentPath: string) => {
  if (menuPath === '/') return currentPath === '/'
  const section = menuPath.split('/')[1]
  return currentPath === `/${section}` || currentPath.startsWith(`/${section}/`)
}
