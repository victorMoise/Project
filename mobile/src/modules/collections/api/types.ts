export type CollectionDto = {
  id: number;
  name: string;
  description: string | null;
};

export type CreateCollectionCommand = {
  name: string;
  description: string | null;
};

export type UpdateCollectionCommand = CreateCollectionCommand;

export type ItemDto = {
  id: number;
  name: string;
  description: string | null;
  purchasePrice: number;
  estimatedValue: number | null;
  purchaseDate: string;
  collectionId: number | null;
};

export type CreateItemCommand = {
  name: string;
  description: string | null;
  purchasePrice: number;
  estimatedValue: number | null;
  purchaseDate: string;
  collectionId: number | null;
};

export type UpdateItemCommand = CreateItemCommand;
