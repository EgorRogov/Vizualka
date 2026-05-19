import React, { useState, useEffect, useRef } from 'react';

interface CellProps {
  id: string;
  value: string;
  displayValue: string;
  onChange: (id: string, val: string) => void;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Cell: React.FC<CellProps> = ({ 
  id, value, displayValue, onChange, isSelected, onSelect, onKeyDown, onContextMenu, style 
}) => {
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
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(false); e.stopPropagation(); }}
        />
      ) : (
        <span>{displayValue}</span>
      )}
    </div>
  );
};