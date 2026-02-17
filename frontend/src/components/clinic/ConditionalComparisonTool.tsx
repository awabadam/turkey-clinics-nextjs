import { useRouterState } from "@tanstack/react-router";
import { ComparisonTool } from "./ComparisonTool";

export function ConditionalComparisonTool() {
  const router = useRouterState();
  const pathname = router.location.pathname;
  
  // Don't show comparison tool on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  
  return <ComparisonTool />;
}

