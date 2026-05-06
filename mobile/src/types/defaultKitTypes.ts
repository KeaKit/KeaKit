import { ItemCatalog } from "./index";

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
