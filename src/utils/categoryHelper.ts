import type { Product } from '../types';

export const MAIN_GROUPS = [
  'Badezimmer',
  'Wohnzimmer',
  'Büro & Homeoffice',
  'Schlafzimmer',
  'Küche & Haushalt',
  'Haustiere',
  'Outdoor'
] as const;

export type MainGroup = typeof MAIN_GROUPS[number];

const KEYWORD_MAPPING: Record<MainGroup, string[]> = {
  'Badezimmer': ['bad', 'badezimmer', 'hochschrank', 'unterschrank', 'spiegelschrank', 'waschbecken', 'handtuch'],
  'Wohnzimmer': ['wohnzimmer', 'wohn', 'sideboard', 'kommode', 'regal', 'tv', 'fernseh', 'konsolentisch', 'vitrine', 'couch', 'sofa', 'sessel'],
  'Büro & Homeoffice': ['büro', 'office', 'schreibtisch', 'computer', 'akten', 'rollcontainer', 'arbeitsplatz', 'drehstuhl', 'stuhl'],
  'Schlafzimmer': ['schlafzimmer', 'nacht', 'nachttisch', 'schminktisch', 'kleiderschrank', 'bett', 'matratze'],
  'Küche & Haushalt': ['küche', 'haushalt', 'küchenregal', 'servierwagen', 'vorrat', 'müll', 'abfall', 'nische', 'wagen'],
  'Haustiere': ['katze', 'hund', 'haustier', 'kratz', 'kratzbaum', 'pfote', 'käfig', 'gehege'],
  'Outdoor': ['garten', 'outdoor', 'balkon', 'terrasse', 'sitzbank', 'blumen', 'pflanze', 'markise']
};

/**
 * Generates a URL-friendly slug from a category name.
 * e.g. "Badezimmerschränke & Regale" -> "badezimmerschraenke-regale"
 */
export const getSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Determines the Main Group for a specific category name based on keywords.
 */
export const getMainCategory = (categoryName: string): MainGroup | 'Sonstiges' => {
  const lowerName = categoryName.toLowerCase();

  for (const group of MAIN_GROUPS) {
    const keywords = KEYWORD_MAPPING[group];
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return group;
    }
  }

  return 'Sonstiges';
};

export type CategoryStructure = Record<MainGroup, string[]>;

/**
 * Scans all products, extracts unique categories, maps them to Main Groups,
 * and returns a structured object for the Mega Menu.
 */
export const getCategoriesByMainGroup = (products: Product[]): CategoryStructure => {
  // 1. Extract unique categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // 2. Initialize structure
  const structure: CategoryStructure = {} as CategoryStructure;
  MAIN_GROUPS.forEach(group => {
    structure[group] = [];
  });

  // 3. Map categories
  uniqueCategories.forEach(category => {
    const mainGroup = getMainCategory(category);
    if (mainGroup !== 'Sonstiges') {
      structure[mainGroup].push(category);
    }
  });

  // 4. Sort alphabetically within groups
  Object.keys(structure).forEach(key => {
    structure[key as MainGroup].sort((a, b) => a.localeCompare(b));
  });

  return structure;
};
