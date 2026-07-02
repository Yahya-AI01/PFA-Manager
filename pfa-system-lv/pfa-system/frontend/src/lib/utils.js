import clsx from 'clsx';

export const cn = (...classes) => clsx(classes);

/** Initiales depuis prénom + nom */
export const getInitials = (prenom = '', nom = '') => {
  return `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase() || '?';
};

/** Couleur stable depuis un string (pour avatars sans photo) */
export const colorFromString = (str) => {
  if (!str) return { bg: '#1f1e1d', fg: '#fafaf5' };
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    { bg: '#fc4a17', fg: '#fff' },
    { bg: '#0f766e', fg: '#fff' },
    { bg: '#7c3aed', fg: '#fff' },
    { bg: '#be185d', fg: '#fff' },
    { bg: '#1e40af', fg: '#fff' },
    { bg: '#854d0e', fg: '#fff' },
    { bg: '#166534', fg: '#fff' },
    { bg: '#9f1239', fg: '#fff' },
  ];
  return palettes[Math.abs(hash) % palettes.length];
};

/** Date formatée FR */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Tronque un texte */
export const truncate = (str, n = 100) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
};
