import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { LanguageProvider } from "./components/providers/LanguageProvider";
import { UserProvider } from "./components/providers/UserProvider";
import AuthWrapper from './AuthWrapper';

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
      <AuthWrapper>
        <UserProvider>
          <LanguageProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/item-detail" element={<ItemDetail />} />
                </Routes>
              </Layout>
            </ThemeProvider>
          </LanguageProvider>
        </UserProvider>
      </AuthWrapper>
    </BrowserRouter>
  );
};

export default App;
