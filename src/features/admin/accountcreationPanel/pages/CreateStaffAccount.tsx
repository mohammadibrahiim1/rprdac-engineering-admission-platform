"use client";

import { useState } from "react";
import { ChevronRight, KeyRound, UserPlus, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GrantAccessForm } from "../components/GrantAccessForm";
import { AccessRoster } from "../components/AccessRoaster";
import { MasterPasswordForm } from "../components/MasterPasswordForm";
import { PanelPasswordsModal } from "../components/PanelPasswordModal";
import { useGetAllUsersPanelsQuery } from "../services/panelAccessApi";

export default function CreateStaffAccount() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data } = useGetAllUsersPanelsQuery();
  const accessUsersCount = data?.users?.length ?? 0;

  return (
    <div className="min-h-screen bg-background pb-16 font-sans antialiased text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <nav className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span>Security</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-foreground">
                  Access Control
                </span>
              </nav>
              <h1 className="text-2xl font-bold tracking-tight">
                Panel & Route Access Management
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Assign or revoke individual route permissions and whole panel
                accesses seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden gap-1.5 sm:flex">
                <Users className="h-3.5 w-3.5" />
                {accessUsersCount} Staff Active
              </Badge>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Panel Passwords
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="assign" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assign" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Grant Permissions
            </TabsTrigger>
            <TabsTrigger value="passwords" className="gap-2">
              <Lock className="h-4 w-4" />
              Master Passwords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assign" className="space-y-8">
            <GrantAccessForm onSuccess={() => {}} />
            <AccessRoster />
          </TabsContent>

          <TabsContent value="passwords">
            <MasterPasswordForm />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal */}
      <PanelPasswordsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
