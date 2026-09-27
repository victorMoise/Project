export type CollectionDto = {
  id: number;
  name: string;
};

export type CreateCollectionCommand = {
  name: string;
};

export type UpdateCollectionCommand = {
  name: string;
};

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
  purchaseDate: string;
  collectionId: number | null;
};

export type UpdateItemCommand = CreateItemCommand;

export type ListQuery = {
  limit?: number;
  offset?: number;
};

export type ValidationProblem = {
  status: number;
  title: string;
  errors?: Record<string, string[]>;
};
