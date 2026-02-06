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
  Attributes?: {
    Paper?: string;
    Size?: string;
    Frame?: string;
  };
}

export interface CreativeHubOrder {
  ExternalRef: string;
  Email?: string;
  FirstName?: string; // Root First Name
  LastName?: string; // Root Last Name
  ShippingAddress: {
    FirstName: string;
    LastName: string;
    Line1: string;
    Line2?: string;
    City: string;
    State?: string;
    PostCode: string;
    CountryId?: number; // Integer ID expected by API
    CountryCode?: string; // Fallback?
  };
  BillingAddress?: {
    FirstName: string;
    LastName: string;
    Line1: string;
    Line2?: string;
    City: string;
    State?: string;
    PostCode: string;
    CountryId?: number;
    CountryCode?: string;
  };
  OrderItems: CreativeHubOrderItem[]; // Renamed from Items
}

// 3-Step Order Flow Types
export interface EmbryonicOrderResponse {
  id: number;
  [key: string]: any;
}

export interface DeliveryOption {
  Id: string;
  Description: string;
  Amount: number;
  TaxAmount: number;
  TotalAmount: number;
  Carrier: string;
  Service: string;
  Currency?: string; // Added to fix lint error
}

export interface ConfirmedOrderPayload {
  OrderId: number;
  DeliveryOptionId: string;
  DeliveryChargeExcludingSalesTax?: number;
  DeliveryChargeSalesTax?: number;
  ExternalReference?: string;
}
