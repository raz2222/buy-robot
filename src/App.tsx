import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SiteLayout } from "@/components/layout/SiteLayout";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import Robot from "@/pages/Robot";
import Guides from "@/pages/Guides";
import Guide from "@/pages/Guide";
import Search from "@/pages/Search";
import FindMyRobot from "@/pages/FindMyRobot";
import Humanoids from "@/pages/Humanoids";
import Repair from "@/pages/Repair";
import ForDealers from "@/pages/ForDealers";
import ThankYou from "@/pages/ThankYou";
import About from "@/pages/About";
import Methodology from "@/pages/Methodology";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/robot/:slug" element={<Robot />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guide/:slug" element={<Guide />} />
            <Route path="/search" element={<Search />} />
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
      </BrowserRouter>
    </QueryClientProvider>
  );
}
