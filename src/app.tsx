import { Spreadsheet } from './components/Spreadsheet/Spreadsheet';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <Spreadsheet rows={100} cols={26} />
    </div>
  );
};

export default App;