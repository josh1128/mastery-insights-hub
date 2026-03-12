import { Card, CardContent } from "@/components/ui/card";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground text-sm mt-1">{description}</p>
    </div>
    <Card>
      <CardContent className="p-12 text-center">
        <p className="text-muted-foreground">This section is under development.</p>
      </CardContent>
    </Card>
  </div>
);

export const AdminDashboard = () => <PlaceholderPage title="Admin Dashboard" description="Manage your platform" />;
export const ContentPage = () => <PlaceholderPage title="Content" description="Manage your learning content" />;
export const AutomationsPage = () => <PlaceholderPage title="Automations" description="Set up automated workflows" />;
