"use client";

import { useEffect, useState } from "react";
import { getAllUsers, toggleUserVerification, deleteUser } from "@/lib/db-service";
import { doc, updateDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BadgeCheck, Search, ShieldAlert, Trash2, Mail, Clock, Eye, X, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

// 🔒 SECURITY: Only this email can access
const ADMIN_EMAIL = "wnyaunwa@gmail.com";

export default function UserManager() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 👈 NEW: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // KYC Modal State
  const [reviewUser, setReviewUser] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

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
    setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
    try {
      await toggleUserVerification(userId, !currentStatus);
    } catch (error) {
      console.error("Failed to update", error);
      loadUsers(); 
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("⚠️ Are you sure you want to delete this user? This action cannot be undone.")) {
      await deleteUser(userId);
      loadUsers();
    }
  };

  // 🟢 Approve KYC Application
  const handleApproveKYC = async () => {
    if (!reviewUser) return;
    setProcessing(true);
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await updateDoc(doc(db, "users", reviewUser.id), {
        isVerified: true,
        verificationStatus: "verified",
        verificationExpiryDate: expiryDate.toISOString(),
      });
      
      setReviewUser(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to approve KYC", error);
      alert("Failed to approve application.");
    } finally {
      setProcessing(false);
    }
  };

  // 🔴 Reject KYC Application
  const handleRejectKYC = async () => {
    if (!reviewUser) return;
    if (!confirm("Are you sure you want to reject this application? The farmer will be asked to reapply.")) return;
    
    setProcessing(true);
    try {
      await updateDoc(doc(db, "users", reviewUser.id), {
        isVerified: false,
        verificationStatus: "idle", 
      });
      
      setReviewUser(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to reject KYC", error);
      alert("Failed to reject application.");
    } finally {
      setProcessing(false);
    }
  };

  // 👈 UPDATED FILTER: Safely checks email, name, AND phone
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    const matchName = (user.displayName || "").toLowerCase().includes(search);
    const matchEmail = (user.email || "").toLowerCase().includes(search);
    const matchPhone = (user.phone || user.phoneNumber || "").toLowerCase().includes(search);
    return matchName || matchEmail || matchPhone;
  });

  // 👈 NEW: Pagination Calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;
  if (currentUser?.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      
      {/* 🟢 KYC REVIEW MODAL */}
      {reviewUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 md:p-8 relative my-8 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setReviewUser(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Eye className="text-huku-orange" /> Review KYC Application
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* ID Photo */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">National ID Photo</p>
                <div className="bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 aspect-[4/3]">
                  {reviewUser.verificationData?.nationalIDPhotoURL ? (
                    <img 
                      src={reviewUser.verificationData.nationalIDPhotoURL} 
                      alt="National ID" 
                      className="w-full h-full object-contain bg-black/5"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image provided</div>
                  )}
                </div>
                <a 
                  href={reviewUser.verificationData?.nationalIDPhotoURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-huku-orange text-sm font-bold mt-2 inline-block hover:underline"
                >
                  View Full Size Image
                </a>
              </div>

              {/* Submitted Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name (On ID)</p>
                  <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {reviewUser.verificationData?.fullNameOnID || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {reviewUser.verificationData?.verifiedPhoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Physical Address</p>
                  <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {reviewUser.verificationData?.physicalAddress || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={handleApproveKYC}
                disabled={processing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {processing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> Approve & Verify</>}
              </button>
              <button 
                onClick={handleRejectKYC}
                disabled={processing}
                className="sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <XCircle size={20} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
             <Link href="/dashboard/admin" className="p-2 bg-white rounded-full border hover:bg-slate-50 transition">
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
              placeholder="Search name, email, phone..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-huku-orange w-full md:w-64"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 👈 Reset to page 1 on search
              }}
            />
          </div>
        </div>

        {/* 📋 USERS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px] md:min-w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 md:p-4 text-xs font-bold text-slate-400 uppercase">User</th>
                  <th className="p-3 md:p-4 text-xs font-bold text-slate-400 uppercase hidden md:table-cell">Contact</th>
                  <th className="p-3 md:p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-3 md:p-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((user) => {
                  const isPending = user.verificationStatus === "pending_admin_approval";

                  return (
                    <tr key={user.id} className={`transition ${isPending ? 'bg-orange-50/50' : 'hover:bg-slate-50/50'}`}>
                      
                      {/* User Info */}
                      <td className="p-3 md:p-4 max-w-[140px] sm:max-w-[200px] md:max-w-none">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden border border-slate-200">
                            {user.photoURL ? (
                              <img src={user.photoURL} className="w-full h-full object-cover" />
                            ) : (
                              user.displayName?.[0] || "?"
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 flex items-center gap-1 truncate">
                              <span className="truncate">{user.displayName || "Unknown Name"}</span>
                              {user.isVerified && <BadgeCheck size={14} className="text-blue-500 shrink-0" fill="currentColor" />}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 md:hidden truncate">
                              <span className="truncate">{user.phone || user.email || "No contact info"}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact - DESKTOP ONLY */}
                      <td className="p-3 md:p-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          <span className="flex items-center gap-2 truncate max-w-[200px] lg:max-w-[250px]">
                            <span className="truncate">{user.phone || user.email || "No contact info"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status / Review Button */}
                      <td className="p-3 md:p-4">
                        {isPending ? (
                          <button 
                            onClick={() => setReviewUser(user)}
                            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold bg-huku-orange text-white hover:bg-orange-600 shadow-sm transition animate-pulse whitespace-nowrap"
                          >
                            <Eye size={16} /> <span className="hidden sm:inline">Review KYC</span><span className="sm:hidden">Review</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleVerify(user.id, user.isVerified)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all border whitespace-nowrap ${
                              user.isVerified 
                              ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {user.isVerified ? (
                              <> <BadgeCheck size={14} className="shrink-0"/> Verified </>
                            ) : (
                              <> <ShieldAlert size={14} className="shrink-0"/> Unverified </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 md:p-4 text-right">
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              No users found.
            </div>
          )}

          {/* 👈 NEW: Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
              <div>
                Showing <strong>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> farmers
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}