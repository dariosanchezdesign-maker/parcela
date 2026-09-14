/** Small inline line-icon set — avoids pulling in an icon library. */
window.PARCELA_ICONS = {
  home: '<path d="M3 11 L12 4 L21 11" /><path d="M5 10 V20 H19 V10" /><path d="M10 20 V14 H14 V20" />',
  adu: '<path d="M3 12 L9 7 L15 12" /><path d="M4.5 11.5 V19 H13.5 V11.5" /><path d="M16 20 V15 H21 V20 H16Z" />',
  multifamily: '<path d="M4 20 V6 H11 V20" /><path d="M11 20 V10 H19 V20" /><path d="M6.5 9 H8.5 M6.5 12 H8.5 M6.5 15 H8.5 M13.5 13 H15.5 M13.5 16 H15.5" />',
  renovate: '<path d="M14.5 3.5 L19.5 8.5 L9 19 L4 20 L5 15 Z" /><path d="M13 5 L18 10" />',
  business: '<path d="M4 20 V9 L12 4 L20 9 V20" /><path d="M9 20 V14 H15 V20" /><path d="M9 9 H15" />',
  str: '<path d="M3 19 V9 L12 12 V19" /><path d="M12 12 L21 9 V19" /><path d="M3 19 H21" /><circle cx="7" cy="7" r="1.6" />',
  agricultural: '<path d="M12 20 V9" /><path d="M12 9 C12 9 7 9 7 5 C11 5 12 9 12 9Z" /><path d="M12 13 C12 13 17 13 17 9 C13 9 12 13 12 13Z" /><path d="M6 20 H18" />',
  unknown: '<circle cx="12" cy="12" r="9" /><path d="M9.5 9.3 a2.5 2.5 0 1 1 3.7 2.2 c-0.9 0.6 -1.2 1.1 -1.2 2" /><circle cx="12" cy="16.5" r="0.15" />',
  check: '<path d="M4 12 L9.5 17.5 L20 6" />',
  arrow: '<path d="M5 12 H19" /><path d="M13 6 L19 12 L13 18" />',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11 V16.5 M12 7.6 V7.7"/>'
};
window.parcelaIcon = function (name, size) {
  size = size || 20;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.PARCELA_ICONS[name] || ""}</svg>`;
};
