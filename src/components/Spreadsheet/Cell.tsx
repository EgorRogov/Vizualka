interface CellProps {
  id: string;
  value: string;
  onChange: (id: string, val: string) => void;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const Cell: React.FC<CellProps> = ({ id, value, onChange, isSelected, onSelect }) => {
  return (
    <div 
      className={`cell ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {value}
    </div>
  );
};