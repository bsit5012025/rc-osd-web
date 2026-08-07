import BottomNav from "./components/navigation/BottomNavigationBar";
import TopBar from "./components/navigation/TopBar";


function App() {
  return (
    <>
      <div className="container-fluid px-4 py-3">
        <TopBar />
      </div>
      
      <BottomNav />
    </>   
  );
}

export default App;