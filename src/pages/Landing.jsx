import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShieldCheck, Activity, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed w-full z-50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <div className="bg-primary text-primary-foreground p-1 rounded-lg">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span>MedClinic</span>
        </div>
        <div className="flex gap-4">
          <Link to="/auth?mode=login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/auth?mode=register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Pattern */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 pt-32 space-y-10 relative overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        </div>

        <div className="space-y-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mx-auto w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-primary text-sm font-medium mb-4">
             New: Doctor Schedules & Analytics
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl leading-tight">
            Healthcare Management <br/>
            <span className="text-primary">Reimagined.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your clinic's operations. Manage patients, track prescriptions, and organize staff schedules in one secure dashboard.
          </p>
        </div>

        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <Link to="/auth?mode=register">
            <Button size="lg" className="px-8 h-12 text-base shadow-lg shadow-primary/20">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </Link>
          <Link to="/auth?mode=login">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base">Admin Login</Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl text-left">
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-bold text-xl mb-2">Analytics</h3>
            <p className="text-muted-foreground">Real-time charts and data visualization for clinic performance.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="font-bold text-xl mb-2">Secure</h3>
            <p className="text-muted-foreground">Enterprise-grade security with JWT authentication and role management.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="font-bold text-xl mb-2">Staff Ops</h3>
            <p className="text-muted-foreground">Effortlessly manage doctor assignments and patient appointments.</p>
          </div>
        </div>
      </main>
    </div>
  );
}