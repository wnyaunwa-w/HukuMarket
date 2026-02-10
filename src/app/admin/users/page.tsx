"use client";

import { useEffect, useState } from "react";
import { getAllUsers, toggleUserVerification, deleteUser } from "@/lib/db-service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BadgeCheck, Search, ShieldAlert, Trash2, Mail, Calendar } from "lucide-react";
import Link from "next/link";

// 🔒 SECURITY: Only this email can access
const ADMIN_EMAIL = "wnyaunwa@gmail.com";

export default function UserManager() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔒 STRICT SECURITY CHECK
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email !== ADMIN_EMAIL) {
        alert("⛔️ Access Denied");
        router.push("/dashboard");
      }
    } else if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (currentUser?.email === ADMIN_EMAIL) {
      loadUsers();
    }
  }, [currentUser]);

  async function loadUsers() {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    // Optimistic UI Update (Update screen instantly before DB finishes)
    setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
    
    try {
      await toggleUserVerification(userId, !currentStatus);
    } catch (error) {
      console.error("Failed to update", error);
      loadUsers(); // Revert if failed
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("⚠️ Are you sure you want to delete this user? This action cannot be undone.")) {
      await deleteUser(userId);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user => 
    (user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;
  if (currentUser?.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 bg-white rounded-full border hover:bg-slate-50 transition">
               <ArrowLeft size={20} className="text-slate-600" />
             </Link>
             <div>
               <h1 className="text-3xl font-black text-slate-900">User Manager</h1>
               <p className="text-slate-500">Verify farmers and manage accounts.</p>
             </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name or email..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange w-full md:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 📋 USERS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">User</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Contact</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  
                  {/* User Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} className="w-full h-full object-cover" />
                        ) : (
                          user.displayName?.[0] || "?"
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.displayName || "Unknown Name"}</p>
                        <p className="text-xs text-slate-400">ID: {user.id.substring(0,6)}...</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      {user.email}
                    </div>
                  </td>

                  {/* Status (The Verification Toggle) */}
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleVerify(user.id, user.isVerified)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        user.isVerified 
                        ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {user.isVerified ? (
                        <> <BadgeCheck size={14} /> Verified </>
                      ) : (
                        <> <ShieldAlert size={14} /> Unverified </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              No users found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}