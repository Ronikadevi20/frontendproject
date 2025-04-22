
import { 
  Shield, AlertTriangle, Book, Receipt, PaintBucket, 
  Bell, Users, PanelLeftClose, Key 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PlannedFeatures = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Emergency Access Mode",
      description: "Grant temporary access to trusted contacts in emergency situations",
      badge: "Coming Soon"
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      title: "Panic/Duress Mode",
      description: "Quick activation of security measures when under duress",
      badge: "Planned"
    },
    {
      icon: <Book className="h-6 w-6 text-purple-500" />,
      title: "Secure Notes with Markdown",
      description: "Create and store formatted notes with end-to-end encryption",
      badge: "In Development"
    },
    {
      icon: <Receipt className="h-6 w-6 text-green-500" />,
      title: "Document & Receipt Vault",
      description: "Categorize and search important documents and receipts",
      badge: "In Development"
    },
    {
      icon: <PaintBucket className="h-6 w-6 text-amber-500" />,
      title: "Theme Switching",
      description: "Personalize your experience with custom themes",
      badge: "Coming Soon"
    },
    {
      icon: <PanelLeftClose className="h-6 w-6 text-indigo-500" />,
      title: "Drag & Drop Layout Customization",
      description: "Create your perfect dashboard with customizable widgets",
      badge: "Planned"
    },
    {
      icon: <Bell className="h-6 w-6 text-cyan-500" />,
      title: "AI-Powered Smart Reminders",
      description: "Intelligent notifications for important deadlines and updates",
      badge: "Planned"
    },
    {
      icon: <Users className="h-6 w-6 text-pink-500" />,
      title: "Multi-User Family Vaults",
      description: "Share selected information with family members securely",
      badge: "Coming Soon"
    },
    {
      icon: <Key className="h-6 w-6 text-orange-500" />,
      title: "Advanced Two-Factor Authentication",
      description: "Additional security with multiple verification methods",
      badge: "Coming Soon"
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Planned Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {feature.icon}
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <div className="mt-1">
                    <span className={`
                      px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${feature.badge === 'Coming Soon' ? 'bg-blue-100 text-blue-800' : 
                        feature.badge === 'In Development' ? 'bg-green-100 text-green-800' : 
                        'bg-amber-100 text-amber-800'}
                    `}>
                      {feature.badge}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlannedFeatures;
