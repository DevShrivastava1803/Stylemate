export enum Category {
  TOPS = 'Tops',
  BOTTOMS = 'Bottoms',
  OUTERWEAR = 'Outerwear',
  FOOTWEAR = 'Footwear',
  ACCESSORIES = 'Accessories',
  UNKNOWN = 'Unknown'
}

export interface ClothingItem {
  id: string;
  imageUrl: string; // Base64
  category: Category;
  description: string;
  createdAt: number;
  tags?: string[];
}

export interface UserTraits {
  skinTone?: string;
  hairColor?: string;
  bodyType?: string;
}

export interface UserProfile {
  id: string;
  imageUrl: string | null; // Base64
  traits: UserTraits;
}

export interface Outfit {
  id: string;
  name: string;
  style: string; // derived from styleTags in new spec
  itemIds: string[];
  description: string; // reasoning
  tags: string[];
}

export interface GeneratedOutfitRaw {
  name: string;
  styleTags: string[];
  reasoning: string;
  itemIds: string[];
}
