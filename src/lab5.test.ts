import { describe, it, expect } from 'vitest';
import { where, groupBy, having, sort, query } from '../src/lab5';

type Item = {
  id: number;
  category: string;
  value: number;
};

const data: Item[] = [
  { id: 1, category: 'A', value: 10 },
  { id: 2, category: 'B', value: 20 },
  { id: 3, category: 'A', value: 15 },
  { id: 4, category: 'B', value: 25 },
  { id: 5, category: 'C', value: 30 },
];

describe('query function sequence', () => {

  it('filters with where', () => {
    const result = query(
      where('category', 'A')
    )(data);

    expect(result).toEqual([
      { id: 1, category: 'A', value: 10 },
      { id: 3, category: 'A', value: 15 },
    ]);
  });

  it('sorts after where', () => {
    const result = query(
      where('category', 'B'),
      sort('value')
    )(data);

    expect(result).toEqual([
      { id: 2, category: 'B', value: 20 },
      { id: 4, category: 'B', value: 25 },
    ]);
  });

  it('groups after filtering', () => {
    const result = query(
      where('value', 10),
      groupBy('category')
    )(data);

    expect(result).toEqual([
      { key: 'A', items: [{ id: 1, category: 'A', value: 10 }] }
    ]);
  });

  it('supports full sequence: where -> sort -> groupBy -> having', () => {
    const result = query(
      where('value', 25),
      sort('id'),
      groupBy('category'),
      having(g => g.items.length === 1)
    )(data);

    expect(result).toEqual([
      { key: 'B', items: [{ id: 4, category: 'B', value: 25 }] }
    ]);
  });

});