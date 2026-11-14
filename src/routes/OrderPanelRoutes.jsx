// import Orders from "../../features/dashboards/admin/orderPanel/pages/Orders";
// import AddBooks from "../../features/dashboards/admin/orderPanel/pages/BookManagement";
// import Shipping from "../../features/dashboards/admin/orderPanel/pages/Shipping";

import BookManagement from "@/features/admin/orderPanel/pages/BookManagement";
import Orders from "@/features/admin/orderPanel/pages/Orders";
import Shipping from "@/features/admin/orderPanel/pages/Shipping";

export const OrderPanelRoutes = [
  {
    path: "admin/order/all",
    element: (
      //<AdmissionPrivateRoute panelName="order">
      <Orders />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Global Bookshop Orders Ledger" },
  },
  {
    path: "admin/product-management",
    element: (
      //<AdmissionPrivateRoute panelName="order">
      <BookManagement />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Inventory & Stock Optimization" },
  },
  {
    path: "admin/shipping",
    element: (
      // <AdmissionPrivateRoute panelName="order">
      <Shipping />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Shipping Logistics & Transits" },
  },
];
