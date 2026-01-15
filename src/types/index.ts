// Product Types
export interface CreativeHubSettings {
  sku: string;
  paperId: string;
  size: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  priceId: string; // Stripe Price ID
  price: number;
  currency: string;
  creativeHubSettings: CreativeHubSettings;
  // Optional CreativeHub metadata
  creativeHubProductId?: number;
  creativeHubPrintOptionId?: number;
  printOptionDescription?: string;
  isLimitedEdition?: boolean;
  editionsLimit?: number;
  editionsSold?: number;
  hasFrame?: boolean;
  costPerItem?: number;
  artistName?: string | null;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order Types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface CreativeHubOrderItem {
  external_sku: string;
  quantity: number;
  attributes: {
    paper: string;
    size: string;
  };
}

export interface CreativeHubOrder {
  external_ref: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  items: CreativeHubOrderItem[];
}
