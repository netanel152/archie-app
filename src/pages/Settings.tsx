import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "../components/providers/LanguageProvider";
import { Languages, Users, Shield, FileDown, Trash2 } from 'lucide-react';

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('settings_title')}</h1>
      </div>
      
      <div className="space-y-8">
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Languages /> {t('language')}</CardTitle>
            <CardDescription>Choose the language for the application interface.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Household Accounts</CardTitle>
            <CardDescription>Share your vault with family members. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">This feature will allow you to invite others to view and add items to your vault, perfect for managing household assets together.</p>
          </CardContent>
          <CardFooter>
             <Button disabled>Invite Member</Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield /> Advanced Security</CardTitle>
            <CardDescription>Manage your account security settings. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-slate-600">We are working on features like Two-Factor Authentication (2FA) and active session management to give you more control over your account's security.</p>
             <Button variant="outline" disabled>Enable 2FA</Button>
          </CardContent>
        </Card>

         <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileDown /> Data Management</CardTitle>
            <CardDescription>Export or delete your account data.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Export All My Data</h3>
                <p className="text-sm text-slate-500 mb-2">Download a complete archive of all your items and receipts.</p>
                <Button variant="secondary">Download Archive</Button>
              </div>
              <div>
                 <h3 className="font-semibold text-red-600">Delete Account</h3>
                 <p className="text-sm text-slate-500 mb-2">Permanently delete your account and all associated data. This action cannot be undone.</p>
                 <Button variant="destructive">Delete My Account</Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}