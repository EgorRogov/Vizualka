//1
export type Transform<T> = (data: T[]) => T[];

//2
export type Where<T> = <K extends keyof T>(
    key: K,
    value: T[K]
) => Transform <T>;

//3

export type Sort<T> = <K extends keyof T>(
    key: K,
) => Transform<T>;

//4
export type Group<T,K extends keyof T> = {
    key: T[K];
    items: T[];
};
//5
export type GroupBy<T> = <K extends keyof T>(
    key: K
)=> (data: T[]) => Group<T,K>[];
//6
export type GroupTransform<T,K extends keyof T> = (
    groups: Group<T,K>[]
)=> Group<T,K>[];
//7
export type Having<T> = <K extends keyof T>(
    predicate: (group: Group<T, K>) => boolean
) => GroupTransform<T, K>;

//8
export function query<T>(...steps: Array<any>): Transform<T> {
  return (items: T[]) => {
    let result: any = items;
    for (const step of steps) {
      result = step(result);
    }
    return result;
  };
}

export const where: Where<any> = (key, value) => (items) =>
  items.filter(item => item[key] === value);

export const sort: Sort<any> = (key) => (items) =>
  [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });

export const groupBy: GroupBy<any> = <T, K extends keyof T>(key: K) => (items: T[]) => {
  const map = new Map<T[K], T[]>(); 
  for (const item of items) {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  
  const groups: Group<T, K>[] = [];
  for (const [groupKey, groupItems] of map.entries()) {
    groups.push({ key: groupKey, items: groupItems });
  }
  return groups;
};

export const having: Having<any> = (predicate) => (groups) =>
  groups.filter(predicate);
