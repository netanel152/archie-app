
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/providers/ThemeProvider.tsx";

// Import your main components and pages
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ItemDetail from "./pages/ItemDetail";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/item-detail" element={<ItemDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

