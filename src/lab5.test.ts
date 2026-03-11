
import { describe, it, expect } from 'vitest';
import { where, sort, groupBy, having, query } from './lab5';

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const users: User[] = [
  { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
  { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
  { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
  { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];

describe('Pipeline - фильтрация, сортировка, группировка', () => {
  
  it('фильтрация и сортировка пользователей', () => {
    const search = query<User>(
      where("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );

    const result = search(users);
    expect(result).toEqual([
      { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
      { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
      { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" }
    ]);
  });

  it('группировка пользователей по городу и фильтр групп', () => {
    const groupAndFilter = query<User>(
      groupBy("city"),
      having((group) => group.items.length > 1)
    );

    const grouped = groupAndFilter(users);

    expect(grouped).toEqual([
      {
        key: "NY",
        items: [
          { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
          { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" }
        ]
      },
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" }
        ]
      }
    ]);
  });

  it('комбинированный конвейер: фильтр, группировка и having', () => {
    const pipeline = query<User>(
      where("surname", "Doe"),
      groupBy("city"),
      having((group) => group.items.some((u) => u.age > 34))
    );

    const result = pipeline(users);

    expect(result).toEqual([
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" }
        ]
      }
    ]);
  });

});