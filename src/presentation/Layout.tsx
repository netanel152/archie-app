

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Home, BarChart2, Settings, Shield, Plus } from "lucide-react";
import { useTranslation } from './components/providers/LanguageContext';
import { LanguageProvider } from "./components/providers/LanguageProvider";
import ItemModal from "./components/dashboard/ItemModal";
import { Button } from "./components/ui/button";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { page: "", icon: Home, label: t('dashboard_nav') },
    { page: "insights", icon: BarChart2, label: t('insights_nav') },
    { page: "settings", icon: Settings, label: t('settings_nav') },
  ];

  const handleSaveItem = (newItem: { title: string; description: string }) => {
    console.log("New item saved:", newItem);
    // Here you would typically handle the form submission, e.g., by sending the data to a server.
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("")} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Archie</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${location.pathname === createPageUrl(item.page)
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <Button onClick={() => setIsModalOpen(true)} className="ml-4">
                <Plus className="w-5 h-5 mr-2" />
                {t('add_new_item')}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        {children}
      </main>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
      />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors w-full ${location.pathname === createPageUrl(item.page)
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
                }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppLayout>{children}</AppLayout>
    </LanguageProvider>
  )
}

