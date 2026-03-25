import { expectTypeOf, test } from 'vitest';
import { DeepReadonly, PickedByType, EventHandlers } from '../src/lab6';

test('DeepReadonly', () => {
  type Input = {
    a: number;
    b: {
      c: string;
    };
  };

  type Expected = {
    readonly a: number;
    readonly b: {
      readonly c: string;
    };
  };

  expectTypeOf<DeepReadonly<Input>>().toEqualTypeOf<Expected>();
});

test('PickedByType', () => {
  type Obj = {
    name: string;
    age: number;
    isAdmin: boolean;
  };

  expectTypeOf<PickedByType<Obj, string>>()
    .toEqualTypeOf<{ name: string }>();

  expectTypeOf<PickedByType<Obj, number>>()
    .toEqualTypeOf<{ age: number }>();
});

test('EventHandlers', () => {
  type Events = {
    click: MouseEvent;
    change: Event;
  };

  expectTypeOf<EventHandlers<Events>>().toEqualTypeOf<{
    onClick: (e: MouseEvent) => void;
    onChange: (e: Event) => void;
  }>();
});