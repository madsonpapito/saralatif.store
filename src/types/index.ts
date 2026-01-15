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
  ExternalSku?: string;
  ProductId?: number;
  PrintOptionId?: number;
  Quantity: number;
}

export interface CreativeHubOrder {
  ExternalRef: string;
  ShippingAddress: {
    FirstName: string;
    LastName: string;
    Line1: string;
    Line2?: string;
    City: string;
    State?: string;
    PostCode: string;
    Country: string;
  };
  Items: CreativeHubOrderItem[];
}
