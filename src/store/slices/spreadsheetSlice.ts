import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

export interface SpreadsheetState{
    cells: Record<string,string>;
    selectedCell: string | null;
    rows: number;
    cols: number;
    past: Record<string, string>[];
    future: Record<string, string>[];
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
            state.past.push({ ...state.cells });
            state.future = [];
            
            const { key, value } = action.payload;

            if (value.trim() !== '') {
                state.cells[key] = value;
            } else {
                delete state.cells[key];
            }
        },

        setBatchValues: (state, action: PayloadAction<Record<string, string>>) => {
            state.past.push({ ...state.cells });
            state.future = [];
            state.cells = action.payload;
        },

        undo: (state) => {
            if (state.past.length === 0) return;
            
            const previous = state.past.pop();
            
            if (previous) {
                state.future.push({ ...state.cells });
                state.cells = previous;
            }
        },

        redo: (state) => {
            if (state.future.length === 0) return;
            
            const next = state.future.pop();
            
            if (next) {
                state.past.push({ ...state.cells });
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
    setBatchValues,
    undo,
    redo,
    clearSpreadsheet,
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;