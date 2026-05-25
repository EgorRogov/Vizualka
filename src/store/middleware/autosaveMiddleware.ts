import { Middleware, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { saveDocument } from '@/store/slices/documentsSlice';
import { setSaveStatus } from '@/store/slices/uiSlice';

let debounceTimeout: NodeJS.Timeout | null = null;

interface MiddlewareState {
  documents: {
    activeId: string | null;
  };
}

export const autosaveMiddleware: Middleware<{}, MiddlewareState> = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (
    typeof action === 'object' && action !== null && 'type' in action &&
    (action.type === 'spreadsheet/updateCell' || action.type === 'spreadsheet/setBatchValues')
  ) {
    const state = storeApi.getState();
    
    if (!state.documents.activeId) return result;

    storeApi.dispatch(setSaveStatus('Сохранение...'));

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      const typedDispatch = storeApi.dispatch as ThunkDispatch<MiddlewareState, undefined, UnknownAction>;
      typedDispatch(saveDocument());
    }, 1500);
  }
  return result;
};