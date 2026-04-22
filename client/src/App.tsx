import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "./lib/trpc";

const Patients = lazy(() => import("./pages/Patients"))
const Doctors = lazy(() => import("./pages/Doctors"));
const Specialties = lazy(() => import("./pages/Specialties"));
const Appointments = lazy(() => import("./pages/Appointments"));
const MedicalRecordsPage = lazy(() => import("./pages/MedicalRecords").then(module => ({ default: module.MedicalRecordsPage })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}

function Router() {
  const { data: auth, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path={"\\"} component={Home} />
        <Route path={"/patients"} component={Patients} />
        {/* Exemplo de rota protegida: apenas Admin vê médicos */}
        {auth?.user?.role === 'admin' && <Route path={"/doctors"} component={Doctors} />}
        <Route path={"/specialties"} component={Specialties} />
        <Route path={"/appointments"} component={Appointments} />
        <Route path="/records/:patientId">
          {(params) => <MedicalRecordsPage patientId={Number(params.patientId)} />}
        </Route>
       
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
