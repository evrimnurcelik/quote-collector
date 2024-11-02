// src/types.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Quote {
  _id: string;
  text: string;
  author?: string;
  book?: string;
  tags: string[];
  collections: string[];
  note?: string;
  userId: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
