export interface PaginationMeta {
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data:    T[];
  meta:    PaginationMeta;
}

export interface PaginationParams {
  page?:      number;
  limit?:     number;
  sortBy?:    string;
  sortOrder?: 'asc' | 'desc';
  search?:    string;
}