
import type { Product, ThemeColors } from './types';

export const THEME: ThemeColors = {
  primary: '#2b4736',
  secondary: '#e8ece9', // slightly lighter green/gray mix
  text: '#333333',
  background: '#f7f7f7',
  surface: '#ffffff',
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'keramik-vase-luna', // Match slug for easy fallback lookup
    title: 'Keramik Vase "Luna"',
    slug: 'keramik-vase-luna',
    price: 49.90,
    category: 'Wohnen',
    description: 'Handgefertigte Keramikvase in mattem Weiß. Perfekt für Trockenblumen oder als solitäres Deko-Objekt.',
    image: 'https://picsum.photos/id/106/800/800',
    isNew: true,
    stock: 45, // Case A: > 30 (Vorrätig)
    isOutOfStock: false,
  },
  {
    id: '2',
    sku: 'wollteppich-nordic',
    title: 'Wollteppich "Nordic"',
    slug: 'wollteppich-nordic',
    price: 129.00,
    salePrice: 99.00,
    category: 'Textilien',
    description: 'Weicher Teppich aus 100% nachhaltiger Wolle. Minimalistisches Muster in Beige und Grau.',
    image: 'https://picsum.photos/id/111/800/800',
    stock: 15, // Case B: 11-20 (Yellow)
    isOutOfStock: false,
  },
  {
    id: '3',
    sku: 'holzstuhl-eiche',
    title: 'Holzstuhl "Eiche"',
    slug: 'holzstuhl-eiche',
    price: 199.50,
    category: 'Möbel',
    description: 'Robuster Esszimmerstuhl aus massiver Eiche. Zeitloses Design und hoher Sitzkomfort.',
    image: 'https://picsum.photos/id/128/800/800',
    stock: 5, // Case B: 1-10 (Red)
    isOutOfStock: false,
  },
  {
    id: '4',
    sku: 'tischleuchte-glow',
    title: 'Tischleuchte "Glow"',
    slug: 'tischleuchte-glow',
    price: 89.00,
    salePrice: 69.90,
    category: 'Beleuchtung',
    description: 'Moderne Tischleuchte mit Messingfuß und warmem Licht. Dimmbar.',
    image: 'https://picsum.photos/id/112/800/800',
    stock: 25, // Case B: 21-30 (Green)
    isOutOfStock: false,
  },
  {
    id: '5',
    sku: 'pflanztopf-set',
    title: 'Pflanztopf Set',
    slug: 'pflanztopf-set',
    price: 34.95,
    category: 'Garten',
    description: 'Dreiteiliges Set aus Terrakotta-Töpfen. Frostsicher und UV-beständig.',
    image: 'https://picsum.photos/id/152/800/800',
    isNew: true,
    stock: 0, // Case C: Stock 0 (Ausverkauft)
    isOutOfStock: true,
  },
  {
    id: '6',
    sku: 'kuscheldecke-cozy',
    title: 'Kuscheldecke "Cozy"',
    slug: 'kuscheldecke-cozy',
    price: 59.90,
    category: 'Textilien',
    description: 'Grobstrick-Decke aus Merinowolle. Hält besonders warm an kalten Wintertagen.',
    image: 'https://picsum.photos/id/158/800/800',
    stock: 12, // Case B: 11-20 (Yellow)
    isOutOfStock: false,
  },
];
