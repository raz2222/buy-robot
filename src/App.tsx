import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SiteLayout } from "@/components/layout/SiteLayout";
import Home from "@/pages/Home";

// Every route past the home page is loaded on demand. The hero is the one
// thing that must never wait on an extra chunk, so Home stays a static
// import; everything else only ships to a visitor who actually navigates
// to it, which is most of this app's JS on any given first-page-view.
const Category = lazy(() => import("@/pages/Category"));
const Robot = lazy(() => import("@/pages/Robot"));
const Guides = lazy(() => import("@/pages/Guides"));
const Guide = lazy(() => import("@/pages/Guide"));
const Search = lazy(() => import("@/pages/Search"));
const Comparisons = lazy(() => import("@/pages/Comparisons"));
const Compare = lazy(() => import("@/pages/Compare"));
const FindMyRobot = lazy(() => import("@/pages/FindMyRobot"));
const Humanoids = lazy(() => import("@/pages/Humanoids"));
const Repair = lazy(() => import("@/pages/Repair"));
const ForDealers = lazy(() => import("@/pages/ForDealers"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const About = lazy(() => import("@/pages/About"));
const Methodology = lazy(() => import("@/pages/Methodology"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// The admin is loaded on demand: a shopper should never download the CMS.
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminLogin = lazy(() => import("@/admin/Login"));
const AdminDashboard = lazy(() => import("@/admin/Dashboard"));
const AdminLeads = lazy(() => import("@/admin/Leads"));
const AdminRobots = lazy(() => import("@/admin/Robots"));
const AdminRobotEditor = lazy(() => import("@/admin/RobotEditor"));
const AdminGuides = lazy(() => import("@/admin/Guides"));
const AdminStores = lazy(() => import("@/admin/Stores"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function AdminFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface">
      <p className="text-sm text-muted-foreground">טוען…</p>
    </div>
  );
}

/** No visible chrome — a route chunk on a broadband connection resolves
 * in a beat, and flashing a skeleton for that would read as jank rather
 * than progress. Slower connections still get the browser's own loading
 * affordance (tab spinner, progress bar). */
function RouteFallback() {
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/robot/:slug" element={<Robot />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guide/:slug" element={<Guide />} />
              <Route path="/search" element={<Search />} />
              <Route path="/comparisons" element={<Comparisons />} />
              <Route path="/compare/:slugA/:slugB" element={<Compare />} />
              <Route path="/find-my-robot" element={<FindMyRobot />} />
              <Route path="/humanoids" element={<Humanoids />} />
              <Route path="/repair" element={<Repair />} />
              <Route path="/for-dealers" element={<ForDealers />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/about" element={<About />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="robots" element={<AdminRobots />} />
              <Route path="robots/:id" element={<AdminRobotEditor />} />
              <Route path="guides" element={<AdminGuides />} />
              <Route path="stores" element={<AdminStores />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
