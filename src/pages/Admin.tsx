import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users } from 'lucide-react';
import { DairyCentersTab } from '@/components/admin/DairyCentersTab';
import { UsersTab } from '@/components/admin/UsersTab';

const Admin = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage dairy centers and users
          </p>
        </div>

        <Tabs defaultValue="dairy-centers" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dairy-centers" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Dairy Centers
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dairy-centers">
            <DairyCentersTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
