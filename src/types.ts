export type ProductCategory = 
  | 'Eggs'
  | 'Meat'
  | 'Chicken'
  | 'Mushroom'
  | 'Honey'
  | 'Dairy'
  | 'Vegetables'
  | 'Fruits'
  | 'Rice'
  | 'Grains';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  fallbackImage?: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  availableWeights: string[];
  defaultWeight: string;
  badge?: string;
  farmOrigin: string;
  stock: boolean;
  featured?: boolean;
  organicCert?: string;
  tags: string[];
  nutritionHighlights?: string[];
}

export interface CartItem {
  id: string; // unique item id: `${productId}-${weight}`
  product: Product;
  selectedWeight: string;
  quantity: number;
  price: number;
}

export interface StoryStage {
  id: number;
  stageNumber: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  quote: string;
  image: string;
  features: string[];
}

export interface FarmBenefit {
  id: number;
  iconName: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  badge: string;
  verified: boolean;
  avatar: string;
  productPurchased: string;
}

export interface FarmMetric {
  id: number;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMethod: 'UPI' | 'Card' | 'COD';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  timestamp: string;
}
