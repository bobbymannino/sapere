import { asc, desc } from "drizzle-orm";
import type { AnyColumn, SQL, SQLWrapper } from "drizzle-orm";

export type SortDirection = "asc" | "desc";

export type Ordered<TSort extends string> = {
  sortBy?: Nullable<LiteralUnion<TSort>>;
  sortDir?: Nullable<LiteralUnion<SortDirection>>;
};

export type OrderByTarget = AnyColumn | SQLWrapper;

type BuildOrderClauseOptions<TSort extends string> = {
  columns: Record<TSort, OrderByTarget | OrderByTarget[]>;
  defaultSortBy: TSort;
  defaultSortDir: SortDirection;
};

export function buildOrderClause<TSort extends string>(
  ordered: Ordered<TSort>,
  options: BuildOrderClauseOptions<TSort>,
): SQL[] {
  const sortDir = isSortDirection(ordered.sortDir) ? ordered.sortDir : options.defaultSortDir;
  const sortBy = isSortKey(ordered.sortBy, options.columns) ? ordered.sortBy : options.defaultSortBy;

  const column = options.columns[sortBy];
  if (Array.isArray(column)) return sortDir === "asc" ? column.map((c) => asc(c)) : column.map((c) => desc(c));
  return sortDir === "asc" ? [asc(column)] : [desc(column)];
}

function isSortDirection(sortDir: Nullable<string> | undefined): sortDir is SortDirection {
  return sortDir === "asc" || sortDir === "desc";
}

function isSortKey<TSort extends string>(
  sort: Nullable<string> | undefined,
  columns: Record<TSort, OrderByTarget | OrderByTarget[]>,
): sort is TSort {
  return typeof sort === "string" && Object.hasOwn(columns, sort);
}

type PaginationValue = number | string;

export type PaginationArgs = {
  page?: Nullable<PaginationValue>;
  perPage?: Nullable<PaginationValue>;
};

type PaginationDefaults = {
  /** @default 96 */
  maxPerPage?: number;
  /** @default 1 */
  page?: number;
  /** @default 12 */
  perPage?: number;
};

export type PaginationWindow = {
  limit: number;
  offset: number;
  page: number;
  perPage: number;
};

export type Paginated<T> = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  perPage: number;
  results: T[];
  total: number;
  totalPages: number;
};

export function buildPagination(args: PaginationArgs, defaults?: PaginationDefaults): PaginationWindow {
  const maxPerPage = toPositiveInteger(defaults?.maxPerPage, 96);
  const page = toPositiveInteger(args.page, defaults?.page ?? 1);
  const perPage = Math.min(toPositiveInteger(args.perPage, defaults?.perPage ?? 12), maxPerPage);

  return {
    limit: perPage,
    offset: (page - 1) * perPage,
    page,
    perPage,
  };
}

export function buildPaginatedResult<T>(results: T[], total: number, pagination: PaginationWindow): Paginated<T> {
  const totalPages = Math.ceil(total / pagination.perPage);
  const hasPreviousPage = pagination.page > 1;
  const hasNextPage = totalPages > pagination.page;

  return {
    hasNextPage,
    hasPreviousPage,
    page: pagination.page,
    perPage: pagination.perPage,
    results,
    total,
    totalPages,
  };
}

function toPositiveInteger(value: Nullable<PaginationValue> | undefined, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return number;
}
