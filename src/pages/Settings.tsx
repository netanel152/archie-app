import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "../components/providers/LanguageContext";
import { Languages, Users, Shield, FileDown, Moon, Sun } from "lucide-react";
import { useTheme } from "../components/providers/ThemeProvider";

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("settings_title")}
        </h1>
      </div>

      <div className="space-y-8">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Languages /> {t("language")}
            </CardTitle>
            <CardDescription>
              Choose the language for the application interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Moon /> Theme
            </CardTitle>
            <CardDescription>
              Select the theme for the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Users /> Household Accounts
            </CardTitle>
            <CardDescription>
              Share your vault with family members. (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              This feature will allow you to invite others to view and add items
              to your vault, perfect for managing household assets together.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled>Invite Member</Button>
          </CardFooter>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Shield /> Advanced Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings. (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              We are working on features like Two-Factor Authentication (2FA)
              and active session management to give you more control over your
              account's security.
            </p>
            <Button variant="outline" disabled>
              Enable 2FA
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <FileDown /> Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your account data.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Export All My Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Download a complete archive of all your items and receipts.
              </p>
              <Button variant="secondary">Download Archive</Button>
            </div>
            <div>
              <h3 className="font-semibold text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button variant="destructive">Delete My Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
