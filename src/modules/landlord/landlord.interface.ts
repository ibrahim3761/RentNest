export interface ICreateProperty {
  title: string;
  description: string;
  location: string;
  city: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  categoryId: string;
}

export interface IUpdateProperty {
  title?: string;
  description?: string;
  location?: string;
  city?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  isAvailable?: boolean;
  categoryId?: string;
}