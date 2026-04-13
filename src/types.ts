
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number; // Optionaler Angebotspreis
  image: string;
  category: string;
  subcategory?: string; // New field for routing
  slug: string;
  isNew?: boolean; // Optionales Flag für neue Produkte
  // Added fields for Sheets API
  name?: string; // Google Sheets uses 'name' instead of 'title'
  sku?: string;
  stock?: number;
  images?: string[];
  isOutOfStock?: boolean;
  supplierUrl?: string; // URL to supplier product page (e.g., Songmics)
  ricardoStatus?: 'POSTED' | 'ERROR'; // Status for Ricardo auto-poster

  // Multi-source & Price Metadata
  source?: string; // 'songmics', 'amazon', etc.
  pricePrev?: number; // Previous/Strike-through price (DE/EU)
  price_ch?: number; // Current price Switzerland
  pricePrev_ch?: number; // Previous/Strike-through price Switzerland
  vp_ch?: number; // Verkaufspreis Schweiz (Spalte W)
  ek_ch?: number; // Einkaufspreis/Basispreis Schweiz (Spalte U)
  displayScore?: number; // Sorting score for bestsellers
  ShopStatus?: 'active' | 'hero' | 'hidden'; // Visibility control
  world?: 'work' | 'beauty'; // Assignment to brand worlds
  reviews?: Review[];
}

export interface Review {
  author: string;
  rating: number; // 1-5
  verified: boolean;
  title: string;
  text: string;
  images?: string[];
  date?: string; // Optional, though visual req said "No date", good to have in model
}

export interface CartItem extends Product {
  quantity: number;
}

export type ThemeColors = {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  surface: string;
};