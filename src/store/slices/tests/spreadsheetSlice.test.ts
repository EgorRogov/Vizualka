import { describe, test, expect, beforeEach } from 'vitest';
import spreadsheetReducer, {
  updateCell,
  setBatchValues,
  undo,
  redo,
  clearSpreadsheet,
  SpreadsheetState
} from '../spreadsheetSlice';

describe('spreadsheetSlice reducer', () => {
  const initialState: SpreadsheetState = {
    cells: {},
    selectedCell: null,
    rows: 100,
    cols: 26,
    past: [],
    future: []
  };

  test('должен возвращать дефолтный стейт', () => {
    expect(spreadsheetReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('должен записывать значение в ячейку и сохранять историю в past', () => {
    const state = spreadsheetReducer(initialState, updateCell({ key: 'A1', value: 'Хало' }));
    
    expect(state.cells['A1']).toBe('Хало');
    expect(state.past).toHaveLength(1);
    expect(state.past[0]).toEqual({});
  });

  test('должен удалять ячейку, если передана пустая строка', () => {
    const stateWithCell: SpreadsheetState = {
      ...initialState,
      cells: { 'B2': 'Удали меня' }
    };
    const state = spreadsheetReducer(stateWithCell, updateCell({ key: 'B2', value: '   ' }));
    
    expect(state.cells['B2']).toBeUndefined();
  });

  test('должен заменять все ячейки через setBatchValues (для импорта)', () => {
    const newCells = { 'A1': '123', 'B1': '456' };
    const state = spreadsheetReducer(initialState, setBatchValues(newCells));
    
    expect(state.cells).toEqual(newCells);
    expect(state.past).toHaveLength(1);
  });

  describe('Тестирование Undo / Redo', () => {
    let stateWithHistory: SpreadsheetState;

    beforeEach(() => {
      const state1 = spreadsheetReducer(initialState, updateCell({ key: 'A1', value: 'Первое' }));
      stateWithHistory = spreadsheetReducer(state1, updateCell({ key: 'A1', value: 'Второе' }));
    });

    test('Undo (Ctrl+Z) должен откатывать назад', () => {
      const stateAfterUndo = spreadsheetReducer(stateWithHistory, undo());
      
      expect(stateAfterUndo.cells['A1']).toBe('Первое');
      expect(stateAfterUndo.future).toHaveLength(1);
      expect(stateAfterUndo.future[0]).toEqual({ 'A1': 'Второе' });
    });

    test('Redo (Ctrl+Y) должен возвращать отмененное', () => {
      const stateAfterUndo = spreadsheetReducer(stateWithHistory, undo());
      const stateAfterRedo = spreadsheetReducer(stateAfterUndo, redo());
      
      expect(stateAfterRedo.cells['A1']).toBe('Второе');
      expect(stateAfterRedo.future).toHaveLength(0);
    });
  });

  test('должен полностью сбрасывать стейт при clearSpreadsheet', () => {
    const dirtyState: SpreadsheetState = {
      cells: { 'C3': 'Данные' },
      selectedCell: 'C3',
      rows: 100,
      cols: 26,
      past: [{}],
      future: [{}]
    };
    const state = spreadsheetReducer(dirtyState, clearSpreadsheet());
    
    expect(state.cells).toEqual({});
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });
});