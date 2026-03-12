import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CoursesPage from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import EngagementPage from "./pages/insights/Engagement";
import MasteryPage from "./pages/insights/Mastery";
import CertificateBuilder from "./pages/CertificateBuilder";
import ChatPage from "./pages/ChatPage";
import {
  EventsPage, AdminDashboard, MembersPage,
  ContentPage, AdminEventsPage, ProductsPage, AutomationsPage,
  MessagesInsight, ProductsInsight,
} from "./pages/PlaceholderPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/members" element={<MembersPage />} />
            <Route path="/admin/content" element={<ContentPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/automations" element={<AutomationsPage />} />
            <Route path="/insights/engagement" element={<EngagementPage />} />
            <Route path="/insights/messages" element={<MessagesInsight />} />
            <Route path="/insights/products" element={<ProductsInsight />} />
            <Route path="/insights/mastery" element={<MasteryPage />} />
            <Route path="/certificates" element={<CertificateBuilder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
