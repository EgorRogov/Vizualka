import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddCol: () => void;
  onDeleteCol: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAddRow, onDeleteRow, onAddCol, onDeleteCol }) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => { onAddRow(); onClose(); }}>Добавить строку</button>
      <button onClick={() => { onDeleteRow(); onClose(); }}>Удалить строку</button>
      <button onClick={() => { onAddCol(); onClose(); }}>Добавить столбец</button>
      <button onClick={() => { onDeleteCol(); onClose(); }}>Удалить столбец</button>
    </div>
  );
};