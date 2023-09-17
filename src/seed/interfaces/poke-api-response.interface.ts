export interface PokeApiResponse {
  count: number;
  next: string;
  previous: string;
  results: PokeApiResult[];
}

export interface PokeApiResult {
  name: string;
  url: string;
}
