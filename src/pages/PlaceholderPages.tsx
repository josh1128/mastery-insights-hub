import { Card, CardContent } from "@/components/ui/card";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-6 animate-fade-in">
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

export const EventsPage = () => <PlaceholderPage title="Events" description="Manage your learning events and webinars" />;
export const ChatPage = () => <PlaceholderPage title="Chat" description="Communicate with your learners" />;
export const AdminDashboard = () => <PlaceholderPage title="Admin Dashboard" description="Manage your platform" />;
export const MembersPage = () => <PlaceholderPage title="Members" description="View and manage platform members" />;
export const ContentPage = () => <PlaceholderPage title="Content" description="Manage your learning content" />;
export const AdminEventsPage = () => <PlaceholderPage title="Admin Events" description="Configure events and schedules" />;
export const ProductsPage = () => <PlaceholderPage title="Products" description="Manage your learning products" />;
export const AutomationsPage = () => <PlaceholderPage title="Automations" description="Set up automated workflows" />;
export const MessagesInsight = () => <PlaceholderPage title="Messages" description="Message analytics and insights" />;
export const ProductsInsight = () => <PlaceholderPage title="Product Insights" description="Product performance analytics" />;
