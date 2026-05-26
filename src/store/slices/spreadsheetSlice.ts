import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

export interface CellStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textColor?: string;
    backgroundColor?: string;
    align?: 'left' | 'center' | 'right';
    format?: 'number' | 'percent' | 'currency' | 'date';
}

export interface CellData {
    value: string;
    style?: CellStyle;
}

export interface SpreadsheetState {
    cells: Record<string, CellData>;
    selectedCell: string | null;
    rows: number;
    cols: number;
    past: Record<string, CellData>[];
    future: Record<string, CellData>[];
}

const initialState: SpreadsheetState ={
    cells:{},
    selectedCell: null,
    rows: 100, 
    cols: 26,
    past: [],
    future: [],
};

const spreadsheetSlice = createSlice({
    name: 'spreadsheet',
    initialState,
    reducers: {
        setDimensions: (state, action: PayloadAction<{ rows: number; cols: number }>) => {
            state.rows = action.payload.rows;
            state.cols = action.payload.cols;
        },

        selectCell: (state, action: PayloadAction<string | null>) => {
            state.selectedCell = action.payload;
        },
        
        updateCell: (state, action: PayloadAction<{ key: string; value: string }>) => {
            state.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.future = [];
            
            const { key, value } = action.payload;
            
            if (value.trim() !== '') {
                state.cells[key] = state.cells[key]?.style ? { value, style: state.cells[key].style } : { value };
            } else {
                delete state.cells[key];
            }
        },
        
        updateCellStyle: (state, action: PayloadAction<{ key: string; style: Partial<CellStyle> }>) => {
            state.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.future = [];
            
            const { key, style } = action.payload;
            const currentCell = state.cells[key] || { value: '' };

            state.cells[key] = {
                value: currentCell.value,
                style: {
                    ...(currentCell.style || {}),
                    ...style
                }
            };
        },

        setBatchValues: (state, action: PayloadAction<Record<string, CellData>>) => {
            state.past.push(JSON.parse(JSON.stringify(state.cells)));
            state.future = [];
            state.cells = action.payload;
        },

        undo: (state) => {
            if (state.past.length === 0) return;
            
            const previous = state.past.pop();
            
            if (previous) {
                state.future.push(JSON.parse(JSON.stringify(state.cells)));
                state.cells = previous;
            }
        },

        redo: (state) => {
            if (state.future.length === 0) return;
            
            const next = state.future.pop();
            
            if (next) {
                state.past.push(JSON.parse(JSON.stringify(state.cells)));
                state.cells = next;
            }
        },

        clearSpreadsheet: (state) => {
            state.cells = {};
            state.selectedCell = null;
            state.past = [];
            state.future = [];
        },
    },
});

export const {
    setDimensions,
    selectCell,
    updateCell,
    updateCellStyle,
    setBatchValues,
    undo,
    redo,
    clearSpreadsheet,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;