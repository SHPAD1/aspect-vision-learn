import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Palette,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    instituteName: "Aspect Vision",
    instituteEmail: "info@aspectvision.com",
    institutePhone: "+91 9876543210",
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    autoApproveEnrollments: false,
    requireEmailVerification: true,
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({ title: "Settings saved", description: "Your changes have been saved." });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          System Settings
        </h2>
        <p className="text-muted-foreground">
          Configure your institute settings
        </p>
      </div>

      {/* Institute Info */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Institute Information
        </h3>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="instituteName">Institute Name</Label>
            <Input
              id="instituteName"
              value={settings.instituteName}
              onChange={(e) =>
                setSettings({ ...settings, instituteName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="instituteEmail">Contact Email</Label>
            <Input
              id="instituteEmail"
              type="email"
              value={settings.instituteEmail}
              onChange={(e) =>
                setSettings({ ...settings, instituteEmail: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="institutePhone">Contact Phone</Label>
            <Input
              id="institutePhone"
              value={settings.institutePhone}
              onChange={(e) =>
                setSettings({ ...settings, institutePhone: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Send email notifications for important events
              </p>
            </div>
            <Switch
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableEmailNotifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Send SMS for payment reminders and updates
              </p>
            </div>
            <Switch
              checked={settings.enableSMSNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableSMSNotifications: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security & Permissions
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-approve Enrollments</p>
              <p className="text-sm text-muted-foreground">
                Automatically approve new student enrollments
              </p>
            </div>
            <Switch
              checked={settings.autoApproveEnrollments}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoApproveEnrollments: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Email Verification</p>
              <p className="text-sm text-muted-foreground">
                Users must verify email before accessing dashboard
              </p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
};

export default AdminSettings;
