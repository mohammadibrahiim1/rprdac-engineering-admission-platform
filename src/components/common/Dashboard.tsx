import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ClipboardList,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Students",
      value: "1,240",
      icon: Users,
      change: "+12% this month",
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Exams",
      value: "8",
      icon: ClipboardList,
      change: "3 ongoing today",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Enrolled Batches",
      value: "14",
      icon: BookOpen,
      change: "Across all departments",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Pass Rate",
      value: "89.4%",
      icon: TrendingUp,
      change: "+2.1% from last test",
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            OVERVIEW
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back! Here is a quick overview of your academy.
          </p>
        </div>
        <Button
          className="bg-blue-600 font-bold text-white hover:bg-blue-700 w-fit"
          onClick={() => navigate("/exam/exams")}
        >
          Manage Exams
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-slate-200/80 shadow-sm hover:shadow transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity / Quick Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              System Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-sm font-medium">
              Activity Chart / Data Table Placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between font-medium text-slate-700"
              onClick={() => navigate("/exam/exams")}
            >
              Create New Exam{" "}
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between font-medium text-slate-700"
              onClick={() => navigate("/exam/marks")}
            >
              Student Marks Entry{" "}
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between font-medium text-slate-700"
              onClick={() => navigate("/exam/results")}
            >
              View Results & Merit List{" "}
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
