"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { Users } from "lucide-react";

// Placeholder user data
const users = [
  { id: 1, email: "berget3333@gmail.com", role: "admin" },
  { id: 2, email: "coach@example.com", role: "user" },
  { id: 3, email: "player@example.com", role: "user" },
];

export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <div className="max-w-3xl mx-auto py-8">
        <Card className="bg-slate-900 border-slate-700 mb-8">
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-6 w-6 text-emerald-400" />
            <CardTitle className="text-xl font-bold text-white">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-slate-200">{user.email}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user.role === "admin" ? "bg-emerald-700 text-emerald-200" : "bg-slate-800 text-slate-300"}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminProtectedRoute>
  );
} 