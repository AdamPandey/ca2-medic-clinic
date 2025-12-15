import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-slate-100 p-6 rounded-full">
            <FileQuestion className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-lg text-slate-500 max-w-sm">
            Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
            <Button>Return to Dashboard</Button>
        </Link>
    </div>
  );
}