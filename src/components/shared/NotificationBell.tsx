import { useState, useEffect } from "react";
import { Bell, Send, Users, Building2, Briefcase, User, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface NotificationBellProps {
  canSend?: boolean;
  branchOnly?: boolean;
  userBranchId?: string;
}

const departments = ["Sales", "Support", "Teaching", "Administration"];
const roles = ["admin", "student", "sales", "support", "teacher", "branch_admin"];

export function NotificationBell({ canSend = false, branchOnly = false, userBranchId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target_type: "all",
    target_branch_id: "",
    target_department: "",
    target_role: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    if (canSend && !branchOnly) {
      fetchBranches();
    }
  }, [canSend, branchOnly]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const notificationData: any = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        target_type: formData.target_type,
        sent_by: user?.id,
      };

      if (branchOnly && userBranchId) {
        notificationData.target_branch_id = userBranchId;
        notificationData.target_type = "branch";
      } else {
        if (formData.target_type === "branch" && formData.target_branch_id) {
          notificationData.target_branch_id = formData.target_branch_id;
        }
        if (formData.target_type === "department" && formData.target_department) {
          notificationData.target_department = formData.target_department;
        }
        if (formData.target_type === "role" && formData.target_role) {
          notificationData.target_role = formData.target_role;
        }
      }

      const { error } = await supabase.from("notifications").insert(notificationData);

      if (error) throw error;

      toast({ title: "Success", description: "Notification sent successfully" });
      setIsSendDialogOpen(false);
      setFormData({
        title: "",
        message: "",
        target_type: "all",
        target_branch_id: "",
        target_department: "",
        target_role: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return "bg-info/10 text-info";
      case "warning":
        return "bg-warning/10 text-warning";
      case "success":
        return "bg-success/10 text-success";
      case "error":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {canSend && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  setIsSendDialogOpen(true);
                }}
              >
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.is_read && "bg-primary/5"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeIcon(
                          notification.notification_type
                        )}`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.created_at), "MMM dd, hh:mm a")}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Send Notification Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Notification title"
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Notification message..."
                rows={3}
              />
            </div>

            {!branchOnly && (
              <>
                <div>
                  <Label htmlFor="target_type">Send To</Label>
                  <Select
                    value={formData.target_type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        target_type: value,
                        target_branch_id: "",
                        target_department: "",
                        target_role: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Users
                        </div>
                      </SelectItem>
                      <SelectItem value="branch">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Specific Branch
                        </div>
                      </SelectItem>
                      <SelectItem value="department">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Specific Department
                        </div>
                      </SelectItem>
                      <SelectItem value="role">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Specific Role
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.target_type === "branch" && (
                  <div>
                    <Label htmlFor="branch">Select Branch</Label>
                    <Select
                      value={formData.target_branch_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, target_branch_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.target_type === "department" && (
                  <div>
                    <Label htmlFor="department">Select Department</Label>
                    <Select
                      value={formData.target_department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, target_department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.target_type === "role" && (
                  <div>
                    <Label htmlFor="role">Select Role</Label>
                    <Select
                      value={formData.target_role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, target_role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {branchOnly && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This notification will be sent to all users in your branch.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={sending}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
