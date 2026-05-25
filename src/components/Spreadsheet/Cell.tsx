import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCell } from '@/store/slices/spreadsheetSlice';

interface CellProps {
  id: string;
  displayValue: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Cell: React.FC<CellProps> = ({
  id, displayValue, isSelected, onSelect, onKeyDown, onContextMenu, style
}) => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.spreadsheet.cells[id] || '');

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <div 
      style={style} 
      className={`cell ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onDoubleClick={() => setIsEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
        onKeyDown(e);
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => dispatch(updateCell({ key: id, value: e.target.value }))}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditing(false);
            e.stopPropagation();
          }}
        />
      ) : (
        <span>{displayValue}</span>
      )}
    </div>
  );
};