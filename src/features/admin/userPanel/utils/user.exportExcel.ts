import ExcelJS from "exceljs";
import toast from "react-hot-toast";
import { User } from "../types/User.types";

export const exportUsersToExcel = async (
  users: User[],
  limit: number | "all",
  page: number,
) => {
  if (users.length === 0) {
    toast.error("No data available to export!");
    return;
  }

  const exportData = users.map((user, index) => ({
    "SL No":
      limit === "all" ? index + 1 : index + 1 + (page - 1) * Number(limit),
    "User Name": user.userName,
    Email: user.email,
    Phone: user.phone,
    Role: user.role || user.userType,
    Department: user.department || "N/A",
    Status: user.status,
    "2FA Status": user.twoFactorAuth || "N/A",
    "Joined Date": new Date(user.createdAt).toLocaleDateString(),
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("User Directory");

  if (exportData.length > 0) {
    const keys = Object.keys(exportData[0]);
    const columnWidths = [8, 22, 25, 15, 20, 20, 12, 20, 15];

    worksheet.columns = keys.map((key, index) => ({
      header: key,
      key: key,
      width: columnWidths[index] || 20,
    }));

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "6366F1" }, // Primary Indigo theme color
    };
  }

  worksheet.addRows(exportData);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const safeDate = new Date().toISOString().slice(0, 10);
  const fileName = `User_Directory_${safeDate}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);

  toast.success("Excel spreadsheet downloaded!");
};
