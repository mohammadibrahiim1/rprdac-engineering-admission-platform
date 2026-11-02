import React from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// Placeholder Pages (Apni apnar moto import kore niben)
// import Dashboard from "../pages/Dashboard";
// import Students from "../pages/Students";
// import Invoices from "../pages/Invoices";
// import Batches from "../pages/Batches";
// import Exams from "../pages/Exams";
// import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // MainLayout er vitore <Outlet /> thakbe jar maddhome nested routes render hobe
    children: [
      {
        index: true,
        // element: <Dashboard />, // Base URL ('/') a gele Dashboard dekhabe
      },
      {
        path: "dashboard",
        // element: <Dashboard />,
      },
      {
        path: "students",
        // element: <Students />,
      },
      {
        path: "invoices",
        // element: <Invoices />,
      },
      {
        path: "batches",
        // element: <Batches />,
      },
      {
        path: "exams",
        // element: <Exams />,
      },
    ],
  },
  {
    path: "*",
    // element: <NotFound />, // Unauthorized ba ভুল URL er jonno 404 page
  },
]);
