import React from 'react';

export const ResizeHandle: React.FC<{
  onMouseDown: (e: React.MouseEvent) => void;
}> = ({ onMouseDown }) => (
  <div
    className="resize-handle"
    onMouseDown={onMouseDown}
    style={{
      position: 'absolute', right: 0, top: 0, width: '5px', height: '100%',
      cursor: 'col-resize', zIndex: 10
    }}
  />
);