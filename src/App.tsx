
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationFormView from "./pages/ApplicationFormView";
import VaultPage from "./pages/VaultPage";
import PasswordEntryForm from "./pages/PasswordEntryForm";
import BillEntryForm from "./pages/BillEntryForm";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentForm from "./pages/DocumentForm";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import TrashPage from "./pages/TrashPage";
import PlannedFeatures from "./components/PlannedFeatures";
import VerificationPage from "./pages/VerificationPage";
import PasswordFormView from "./pages/PasswordFormView";
import DocumentView from "./pages/DocumentFormView";
import BillView from "./pages/BillView";
import AItools from "./pages/AItools";
import FollowUp from '@/pages/Ai-tools/FollowUp';
import ResumeBuilder from '@/pages/Ai-tools/ResumeBuilder';
import GlassdoorInsights from '@/pages/Ai-tools/GlassdoorInsights';
import InterviewPrep from '@/pages/Ai-tools/InterviewPrep';
import RecruiterOutreach from '@/pages/Ai-tools/RecruiterOutreach';
import ResumeView from '@/pages/ResumeViewPage';
import CoverView from '@/pages/CoverLetterViewPage';
import InterviewPracticePage from "./pages/ChatPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Ai-tools" element={<AItools />} />
          <Route path="/interview-practice/:jobId/:sessionId" element={<InterviewPracticePage />} />
          <Route path="/Ai-tools/follow-up" element={<FollowUp />} />
          <Route path="/ai-tools/resume-builder" element={<ResumeBuilder />} />
          <Route path="/ai-tools/resume-builder/view/cover/:id" element={<CoverView />} />
          <Route path="/ai-tools/resume-builder/view/resume/:id" element={<ResumeView />} />
          <Route path="/ai-tools/recruiter-outreach" element={<RecruiterOutreach />} />
          <Route path="/ai-tools/interview-prep" element={<InterviewPrep />} />
          <Route path="/ai-tools/glassdoor-insights" element={<GlassdoorInsights />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/AItools" element={<AItools />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/view/:id" element={<ApplicationFormView />} />
          <Route path="/applications/new" element={<ApplicationForm />} />
          <Route path="/applications/edit/:id" element={<ApplicationForm />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/passwords/new" element={<PasswordEntryForm />} />
          <Route path="/passwords/edit/:id" element={<PasswordEntryForm />} />
          <Route path="/passwords/view/:id" element={<PasswordFormView />} />
          <Route path="/bills/new" element={<BillEntryForm />} />
          <Route path="/bills/edit/:id" element={<BillEntryForm />} />
          <Route path="/bills/view/:id" element={<BillView />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/new" element={<DocumentForm />} />
          <Route path="/documents/edit/:id" element={<DocumentForm />} />
          <Route path="/documents/view/:id" element={<DocumentView />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/planned-features" element={<PlannedFeatures />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
