import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BarChart2, Settings, Shield } from "lucide-react";
import { LanguageProvider, useTranslation } from './components/providers/LanguageProvider';

function AppLayout({ children }) {
  const { t, language } = useTranslation();
  const location = useLocation();

  const navItems = [
    { page: "Dashboard", icon: Home, label: t('dashboard_nav') },
    { page: "Insights", icon: BarChart2, label: t('insights_nav') },
    { page: "Settings", icon: Settings, label: t('settings_nav') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          :root {
            --primary-navy: #1e293b;
            --accent-gold: #f59e0b;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --surface-white: #ffffff;
            --surface-gray: #f8fafc;
            --border-light: #e2e8f0;
            --shadow-soft: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            --shadow-medium: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          }
          
          body {
            font-feature-settings: "cv02", "cv03", "cv04", "cv11";
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .lucide-rtl {
             transform: scaleX(-1);
          }
        `}
      </style>
      
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Dashboard")} className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Archie</h1>
                <p className="text-xs text-slate-500 font-medium">Digital Vault</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
              {navItems.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    location.pathname === createPageUrl(item.page)
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                location.pathname === createPageUrl(item.page)
                  ? "text-slate-900"
                  : "text-slate-500"
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function LayoutWrapper({ children }) {
    return (
        <LanguageProvider>
            <AppLayout>{children}</AppLayout>
        </LanguageProvider>
    )
}