import { where, groupBy, having, sort } from './lab4';
export { where, groupBy, having, sort };

export type Transform<T> = (items: T[]) => T[];
export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;
export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> =
  <K extends keyof T>(key: K) => (items: T[]) => Group<T, K>[];

export type GroupTransform<T, K extends keyof T> =
  (groups: Group<T, K>[]) => Group<T, K>[];

export type Having<T> =
  <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) =>
    GroupTransform<T, K>;

type WhereStep<T> = ReturnType<typeof where>;
type SortStep<T> = ReturnType<typeof sort>;
type GroupStep<T, K extends keyof T> = ReturnType<ReturnType<typeof groupBy>>;
type HavingStep<T, K extends keyof T> = ReturnType<ReturnType<typeof having>>;

export function query<T>(
  ...steps: WhereStep<T>[]
): Transform<T>;

export function query<T, K extends keyof T>(
  ...steps: [...WhereStep<T>[], GroupStep<T, K>]
): (items: T[]) => Group<T, K>[];

export function query<T, K extends keyof T>(
  group: GroupStep<T, K>,
  ...having: HavingStep<T, K>[]
): (items: T[]) => Group<T, K>[];

export function query<T, K extends keyof T>(
  group: GroupStep<T, K>,
  ...rest: (HavingStep<T, K> | SortStep<T>)[]
): any;

export function query<T>(...steps: any[]) {
  return (items: any[]) => {
    let result = items;

    for (const step of steps) {
      result = step(result);
    }

    return result;
  };
}