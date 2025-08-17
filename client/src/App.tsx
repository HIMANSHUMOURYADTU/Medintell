import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import ChatPage from "@/pages/ChatPage";
import HealthGoalsPage from "@/pages/HealthGoalsPage";
import FacilityFinderPage from "@/pages/FacilityFinderPage";
import EmergencyPage from "@/pages/EmergencyPage";
import HealthAssessmentPage from "@/pages/HealthAssessmentPage";
import MedicationPage from "@/pages/MedicationPage";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/ui/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/chat/:persona?" component={ChatPage} />
      <Route path="/health-goals" component={HealthGoalsPage} />
      <Route path="/facilities" component={FacilityFinderPage} />
      <Route path="/emergency" component={EmergencyPage} />
      <Route path="/assessment" component={HealthAssessmentPage} />
      <Route path="/medications" component={MedicationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
