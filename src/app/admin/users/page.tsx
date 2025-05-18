
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
const AdminRoute = dynamic(() => import("@/components/auth/AdminRoute"), { ssr: false });
    const AdminUsersPage: React.FC = () => {
      return (
        <AdminRoute>
          <div>
            <h1>Admin Users</h1>
            {/* Add users management content here later */}
          </div>
        </AdminRoute>
      );
    };

    export default AdminUsersPage;