import { asc, desc } from "drizzle-orm";
import type { AnyColumn, SQL, SQLWrapper } from "drizzle-orm";

export type OrderDirection = "asc" | "desc";

export type Ordered<TSort extends string> = {
  order?: Nullable<LiteralUnion<OrderDirection>>;
  sort?: Nullable<LiteralUnion<TSort>>;
};

export type OrderByTarget = AnyColumn | SQLWrapper;

type BuildOrderClauseOptions<TSort extends string> = {
  columns: Record<TSort, OrderByTarget>;
  defaultOrder: OrderDirection;
  defaultSort: TSort;
};

export function buildOrderClause<TSort extends string>(
  ordered: Ordered<TSort>,
  options: BuildOrderClauseOptions<TSort>,
): SQL {
  const order = isOrderDirection(ordered.order) ? ordered.order : options.defaultOrder;
  const sort = isSortKey(ordered.sort, options.columns) ? ordered.sort : options.defaultSort;

  const column = options.columns[sort];
  return order === "asc" ? asc(column) : desc(column);
}

function isOrderDirection(order: Nullable<string> | undefined): order is OrderDirection {
  return order === "asc" || order === "desc";
}

function isSortKey<TSort extends string>(
  sort: Nullable<string> | undefined,
  columns: Record<TSort, OrderByTarget>,
): sort is TSort {
  return typeof sort === "string" && Object.hasOwn(columns, sort);
}
