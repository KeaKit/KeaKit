export interface ItemCatalog {
  id: number;
  itemType: string;
  title: string;
  description: string;
  city: string;
  pricePerMonth: number;
  availableFrom: Date;
  availableUntil: Date;
  category: string;
  totalUnits: number;
  ownerId: number;
  ownerName: string;
  status: string; // solo para ARTICLE
  imageUrl: string; // solo para ARTICLE
}

export interface DefaultKitItem {
  id: number;
  item: ItemCatalog;
}

export interface DefaultKit {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  items: DefaultKitItem[];
}

export interface DefaultKitCreateRequest {
  name: string;
  description: string;
  itemsIds?: number[];
}
