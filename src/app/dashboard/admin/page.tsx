"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getAllUsers, getSubscriptionFee, updateSubscriptionFee, activateUserSubscription, deactivateUserSubscription } from "@/lib/db-service";
import { Loader2, Search, ShieldCheck, DollarSign, CheckCircle, XCircle, Users, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "approvals">("approvals");
  
  // Fee State
  const [fee, setFee] = useState(5);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [newFee, setNewFee] = useState(5);

  const ADMIN_EMAIL = "wnyaunwa@gmail.com";

  useEffect(() => {
    if (currentUser && currentUser.email !== ADMIN_EMAIL) {
      router.push("/dashboard"); // Kick out non-admins
    } else if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  async function loadData() {
    setLoading(true);
    const [allUsers, currentFee] = await Promise.all([
      getAllUsers(),
      getSubscriptionFee()
    ]);
    setUsers(allUsers);
    setFee(currentFee);
    setNewFee(currentFee);
    setLoading(false);
  }

  const handleSaveFee = async () => {
    await updateSubscriptionFee(newFee);
    setFee(newFee);
    setIsEditingFee(false);
    alert("Fee updated successfully!");
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      if(!confirm("Are you sure you want to deactivate this user?")) return;
      await deactivateUserSubscription(userId);
    } else {
      await activateUserSubscription(userId);
    }
    loadData(); // Refresh list
  };

  // Filter lists
  const pendingFarmers = users.filter(u => u.role === 'farmer' && u.subscriptionStatus === 'inactive');
  const activeFarmers = users.filter(u => u.role === 'farmer' && u.subscriptionStatus === 'active');
  const allFiltered = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Super Admin Console 🛡️</h1>
          <p className="text-slate-500">Manage subscriptions, approvals, and fees.</p>
        </div>
      </div>

      {/* 💰 FEE SETTING CARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <DollarSign size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Subscription Fee</h3>
            <p className="text-slate-500 text-sm">Amount farmers pay per month.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {isEditingFee ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl text-slate-400">$</span>
                <input 
                  type="number" 
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  className="w-24 p-2 border-2 border-green-500 rounded-xl font-bold text-2xl text-slate-800 outline-none"
                  autoFocus
                />
                <button onClick={handleSaveFee} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Save</button>
                <button onClick={() => setIsEditingFee(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="font-black text-4xl text-slate-800">
                  {fee === 0 ? "FREE" : `$${fee}`}
                </span>
                <button 
                  onClick={() => setIsEditingFee(true)}
                  className="text-sm font-bold text-green-600 hover:bg-green-50 px-3 py-1 rounded-full transition"
                >
                  Change
                </button>
              </div>
            )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("approvals")}
          className={`pb-3 font-bold px-2 transition ${activeTab === 'approvals' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          Payment Approvals {pendingFarmers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{pendingFarmers.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-3 font-bold px-2 transition ${activeTab === 'users' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          All Users
        </button>
      </div>

      {/* 🟢 APPROVALS TAB */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <AlertCircle size={20} className="text-orange-500"/> 
             Farmers Awaiting Activation ({pendingFarmers.length})
           </h3>
           
           {pendingFarmers.length === 0 ? (
             <div className="p-10 text-center bg-slate-50 rounded-xl text-slate-400">
               No pending approvals. Everyone is active! 🎉
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {pendingFarmers.map(user => (
                 <div key={user.id} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      INACTIVE
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {user.displayName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{user.displayName}</h4>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleToggleStatus(user.id, 'inactive')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle size={16} /> Approve & Activate
                      </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* 👥 ALL USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex gap-2">
            <Search className="text-slate-400" />
            <input 
              className="outline-none w-full text-sm" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {allFiltered.map(user => (
                <tr key={user.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{user.displayName}</div>
                    <div className="text-slate-400 text-xs">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'farmer' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role === 'farmer' && (
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.subscriptionStatus?.toUpperCase() || 'INACTIVE'}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {user.role === 'farmer' && (
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.subscriptionStatus || 'inactive')}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                          user.subscriptionStatus === 'active' 
                          ? 'border-red-200 text-red-500 hover:bg-red-50' 
                          : 'bg-green-500 text-white border-transparent hover:bg-green-600'
                        }`}
                      >
                        {user.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}