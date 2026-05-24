import React, {useState,useEffect} from "react";

export interface Doc {
    id: string;
    name: string;
    rows: number;
    cols: number;
    createdAt: string;
    updatedAt: string;
    data: Record<string,string>;
}

export const Dashboard: React.FC <{onOpenDoc:(id: string)=> void}> = ({onOpenDoc})=>{
    const [docs,setDocs] = useState<Doc[]> ([]);
    const [isModalOpen,setIsModalOpen] = useState(false);

    const [newName,setNewName] = useState('Название таблицы');
    const [newRows,setNewRows] = useState(100);
    const [newCols,setNewCols] = useState(26);

    useEffect(() => {
        const saved = localStorage.getItem(`my_documents`);
        if(saved){
          setDocs(JSON.parse(saved));
        }
    },[]);

    const saveDocsToDB = (newDocs: Doc[]) =>{
        setDocs(newDocs);
        localStorage.setItem(`my_documents`,JSON.stringify(newDocs));
    };

    const createDoc = () =>{
        const newDoc:Doc ={
            id: Date.now().toString(),
            name: newName,
            rows: newRows,
            cols: newCols,
            createdAt: new Date().toISOString(),
            updatedAt : new Date().toISOString(),
            data: {}
        };
        saveDocsToDB([...docs,newDoc]);
        setIsModalOpen(false);
    };

    const deleteDoc = (id: string) => {
        if(window.confirm('Удалить документ?')){
            saveDocsToDB(docs.filter(d => d.id !== id));
            localStorage.removeItem(`my_spreadsheet_cells_${id}`);
        }
    };

    const duplicateDoc = (doc:Doc) => {
        const newName = `${doc.name} (копия)`;
        const copy: Doc = {
            ...doc,
            id: Date.now().toString(),
            name: newName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: { ...doc.data }
        };
        saveDocsToDB([...docs,copy]);
        
        const oldData = localStorage.getItem(`my_spreadsheet_cells_${doc.id}`);
        if(oldData){
            localStorage.setItem(`my_spreadsheet_cells_${copy.id}`,oldData);
        }
    };

    const renameDoc = (id: string,newName: string) => {
        const updated = docs.map(d => d.id === id ? {
            ...d,
            name: newName,
            updatedAt: new Date().toISOString()
        } :d);
        saveDocsToDB(updated);
    };

    return (
    <div style={{ padding: 20 }}>
      <h1>Мои документы</h1>
      <button onClick={() => setIsModalOpen(true)} style={{ marginBottom: 20, padding: '8px 16px' }}>
        + Создать новый
      </button>

      {isModalOpen && (
        <div style={{ border: '1px solid #ccc', padding: 20, marginBottom: 20, width: 300, background: '#f9f9f9' }}>
          <h3>Создание документа</h3>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название" style={{ width: '100%', marginBottom: 10 }} /><br/>
          Строк: <input type="number" value={newRows} onChange={e => setNewRows(Number(e.target.value))} style={{ marginBottom: 10 }} /><br/>
          Колонок: <input type="number" value={newCols} onChange={e => setNewCols(Number(e.target.value))} style={{ marginBottom: 10 }} /><br/>
          <button onClick={createDoc} style={{ marginRight: 10 }}>Сохранить</button>
          <button onClick={() => setIsModalOpen(false)}>Отмена</button>
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {docs.map(doc => (
          <li key={doc.id} style={{ border: '1px solid #ccc', padding: 15, borderRadius: 8, background: '#fff' }}>
            <input 
              value={doc.name} 
              onChange={(e) => renameDoc(doc.id, e.target.value)} 
              style={{ fontWeight: 'bold', fontSize: '18px', border: 'none', width: '100%', borderBottom: '1px dashed #ccc', marginBottom: 10 }}
            />
            <p style={{ margin: '5px 0', fontSize: '12px', color: 'gray' }}>
              Создан: {new Date(doc.createdAt).toLocaleDateString()} <br/>
              Изменен: {new Date(doc.updatedAt).toLocaleTimeString()}
            </p>
            
            <div style={{ marginTop: 15, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => onOpenDoc(doc.id)}>Открыть</button>
              <button onClick={() => duplicateDoc(doc)}>Дублировать</button>
              <button onClick={() => deleteDoc(doc.id)} style={{ color: 'red' }}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
