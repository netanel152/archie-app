import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your main components and pages
import { LanguageProvider } from "./components/providers/LanguageProvider";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ItemDetail from "./pages/ItemDetail";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";

const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/item-detail" element={<ItemDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </Layout>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
