import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CellStyle, updateCellStyle } from "@/store/slices/spreadsheetSlice";
import { useState } from "react";

export const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedCellId = useAppSelector((state) => state.spreadsheet.selectedCell);
  const cell = useAppSelector((state) => selectedCellId ? state.spreadsheet.cells[selectedCellId] : null);
  const style = cell?.style || {};

  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeBgColor, setActiveBgColor] = useState('#ffffff');

  const update = (newStyle: Partial<CellStyle>) => {
    if (!selectedCellId) return;
    dispatch(updateCellStyle({ key: selectedCellId, style: newStyle }));
  };

  if (!selectedCellId) return <div className="toolbar">Выберите ячейку</div>;

  return (
    <div className="toolbar" style={{ display: 'flex', gap: '15px', padding: '10px', background: '#eee', flexWrap: 'wrap', alignItems: 'center' }}>
      <button onClick={() => update({ bold: !style.bold })}><b>B</b></button>
      <button onClick={() => update({ italic: !style.italic })}><i>I</i></button>
      <button onClick={() => update({ underline: !style.underline })}><u>U</u></button>

      <select value={style.align || 'left'} onChange={(e) => update({ align: e.target.value as "left" | "center" | "right" })}>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span>Текст:</span>
        <input type="color" value={activeTextColor} onChange={(e) => setActiveTextColor(e.target.value)} />
        <button onClick={() => update({ textColor: activeTextColor })}>Применить</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span>Фон:</span>
        <input type="color" value={activeBgColor} onChange={(e) => setActiveBgColor(e.target.value)} />
        <button onClick={() => update({ backgroundColor: activeBgColor })}>Залить</button>
      </div>

      <select value={style.format || 'number'} onChange={(e) => update({ format: e.target.value as "number" | "percent" | "currency" | "date" })}>
        <option value="number">Число</option>
        <option value="percent">Процент</option>
        <option value="currency">Валюта</option>
        <option value="date">Дата</option>
      </select>
    </div>
  );
};