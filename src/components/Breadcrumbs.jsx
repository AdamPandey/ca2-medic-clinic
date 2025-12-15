import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumb } from "@/context/BreadcrumbContext"; // Import hook

export default function Breadcrumbs() {
  const location = useLocation();
  const { labels } = useBreadcrumb(); // Get custom labels
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4 capitalize">
      <Link to="/" className="hover:text-blue-600 flex items-center transition-colors">
        <Home className="h-4 w-4 mr-1"/> 
        Home
      </Link>
      {pathnames.map((value, index) => {
        // Reconstruct the full path for this segment (e.g., "/prescriptions/204")
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        
        // 1. Check if we have a custom name in our Context for this path
        // 2. If not, fallback to the URL segment (decodeURI removes %20 spaces)
        const displayName = labels[to] || decodeURIComponent(value);

        const isId = !isNaN(value); 

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-slate-300" />
            {isLast ? (
              <span className="font-semibold text-foreground">
                {displayName}
              </span>
            ) : (
              <Link to={to} className="hover:text-blue-600 transition-colors">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}