"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  getAllUsers, 
  getAllBatches, 
  getSubscriptionFee, 
  updateSubscriptionFee, 
  activateUserSubscription, 
  deactivateUserSubscription,
  toggleUserBlock,
  deleteUser
} from "@/lib/db-service";
import { 
  Loader2, Search, DollarSign, CheckCircle, 
  AlertCircle, Download, Trash2, Ban, Unlock, 
  Bird, Users
} from "lucide-react";

export default function AdminPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"approvals" | "registry">("approvals");
  
  // Stats State
  const [stats, setStats] = useState({
    totalBirds: 0,
    activeSubs: 0,
    totalRevenue: 0 
  });
  
  // Fee State
  const [fee, setFee] = useState(5);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [newFee, setNewFee] = useState(5);

  const ADMIN_EMAIL = "wnyaunwa@gmail.com";

  useEffect(() => {
    if (currentUser && currentUser.email !== ADMIN_EMAIL) {
      router.push("/dashboard"); 
    } else if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  async function loadData() {
    setLoading(true);
    try {
      const [usersData, batchesData, currentFee] = await Promise.all([
        getAllUsers(),
        getAllBatches(), 
        getSubscriptionFee()
      ]);

      // Cast usersData to 'any[]' so TypeScript knows it has 'role' and 'status'
      const allUsers = usersData as any[]; 
      const allBatches = batchesData as any[];

      // 1. Calculate Total Birds
      const birdCount = allBatches.reduce((acc, batch) => acc + (batch.count || 0), 0);

      // 2. Calculate Active Subs
      const activeFarmers = allUsers.filter(u => u.role === 'farmer' && u.subscriptionStatus === 'active');
      
      setUsers(allUsers);
      setFee(currentFee);
      setNewFee(currentFee);
      setStats({
        totalBirds: birdCount,
        activeSubs: activeFarmers.length,
        totalRevenue: activeFarmers.length * currentFee
      });

    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveFee = async () => {
    await updateSubscriptionFee(newFee);
    setFee(newFee);
    setIsEditingFee(false);
    // Recalculate revenue estimate with new fee
    setStats(prev => ({ ...prev, totalRevenue: prev.activeSubs * newFee }));
    alert("Fee updated successfully!");
  };

  const handleToggleSubscription = async (userId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      if(!confirm("Deactivate this farmer's subscription?")) return;
      await deactivateUserSubscription(userId);
    } else {
      await activateUserSubscription(userId);
    }
    loadData();
  };

  const handleBlockUser = async (userId: string, currentBlockStatus: boolean) => {
    const action = currentBlockStatus ? "Unblock" : "Block";
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;
    await toggleUserBlock(userId, currentBlockStatus);
    loadData();
  };

  const handleDeleteUser = async (userId: string) => {
    if(!confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE this user?")) return;
    await deleteUser(userId);
    loadData();
  };

  const downloadCSV = () => {
    const headers = ["Name,Email,Phone,Role,Subscription Status,Blocked Status"];
    const rows = users.map(u => 
      `"${u.displayName || ''}","${u.email || ''}","${u.phoneNumber || 'N/A'}","${u.role}","${u.subscriptionStatus || 'N/A'}","${u.isBlocked ? 'Yes' : 'No'}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `huku_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters
  const pendingFarmers = users.filter(u => u.role === 'farmer' && u.subscriptionStatus === 'inactive');
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-huku-orange" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Super Admin Console 🛡️</h1>
        <p className="text-slate-500">Overview of platform activity and settings.</p>
      </div>

      {/* 📊 UPDATED STATS GRID (Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        
        {/* CARD 1: TOTAL BIRDS */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-huku-orange/30 transition-colors">
          <div className="bg-orange-50 p-3 md:p-4 rounded-xl text-huku-orange shrink-0">
            <Bird size={28} className="md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">Total Birds</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {stats.totalBirds.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* CARD 2: ACTIVE SUBS */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
          <div className="bg-blue-50 p-3 md:p-4 rounded-xl text-blue-600 shrink-0">
            <Users size={28} className="md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">Active Subs</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{stats.activeSubs}</h3>
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-tighter">Farmers</span>
            </div>
          </div>
        </div>

        {/* CARD 3: SUBSCRIPTION FEE */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-1 hover:border-green-200 transition-colors">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-green-50 p-3 md:p-4 rounded-xl text-green-600 shrink-0">
              <DollarSign size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">Monthly Fee</p>
               {isEditingFee ? (
                 <div className="flex items-center gap-1 mt-1">
                   <span className="font-bold text-slate-400">$</span>
                   <input 
                     type="number" 
                     value={newFee}
                     onChange={(e) => setNewFee(Number(e.target.value))}
                     className="w-16 p-1 text-lg border-b-2 border-green-500 bg-transparent font-bold outline-none"
                     autoFocus
                   />
                 </div>
               ) : (
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {fee === 0 ? "FREE" : `$${fee}`}
                </h3>
               )}
            </div>
          </div>

          <div className="shrink-0">
             {isEditingFee ? (
               <div className="flex flex-col gap-1">
                 <button onClick={handleSaveFee} className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">SAVE</button>
                 <button onClick={() => setIsEditingFee(false)} className="text-slate-400 text-[10px] font-bold hover:text-slate-600">CANCEL</button>
               </div>
             ) : (
               <button 
                 onClick={() => setIsEditingFee(true)} 
                 className="text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg border border-green-100 transition-all"
               >
                 CHANGE
               </button>
             )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-slate-200 mt-8">
        <button 
          onClick={() => setActiveTab("approvals")}
          className={`pb-3 font-bold px-2 transition flex items-center gap-2 ${activeTab === 'approvals' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          Payment Approvals 
          {pendingFarmers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingFarmers.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab("registry")}
          className={`pb-3 font-bold px-2 transition ${activeTab === 'registry' ? 'text-huku-orange border-b-2 border-huku-orange' : 'text-slate-400'}`}
        >
          User Registry
        </button>
      </div>

      {/* 🟢 APPROVALS TAB */}
      {activeTab === 'approvals' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <AlertCircle size={20} className="text-orange-500"/> 
             Pending Activations
           </h3>
           
           {pendingFarmers.length === 0 ? (
             <div className="p-10 text-center bg-slate-50 rounded-xl text-slate-400 border border-dashed border-slate-200">
               All cleared! No pending payments. 
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {pendingFarmers.map(user => (
                 <div key={user.id} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">WAITING</div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {user.displayName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{user.displayName}</h4>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleSubscription(user.id, 'inactive')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <CheckCircle size={16} /> Activate
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* 👥 USER REGISTRY TAB */}
      {activeTab === 'registry' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="pl-10 p-2 bg-slate-50 border border-slate-200 rounded-lg w-full outline-none focus:ring-2 ring-orange-100 text-sm" 
                placeholder="Search name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Sub. Status</th>
                  <th className="p-4 text-center">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition ${user.isBlocked ? 'bg-red-50/50' : ''}`}>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {user.displayName}
                        {user.isBlocked && <span className="text-[10px] bg-red-600 text-white px-1.5 rounded">BLOCKED</span>}
                      </div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {user.phoneNumber || <span className="text-slate-300 italic">N/A</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'farmer' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.role === 'farmer' ? (
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold w-fit ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {user.subscriptionStatus?.toUpperCase() || 'INACTIVE'}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Block Button */}
                        <button 
                          onClick={() => handleBlockUser(user.id, user.isBlocked)}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                          className={`p-2 rounded-lg transition ${
                            user.isBlocked 
                            ? "bg-green-100 text-green-600 hover:bg-green-200" 
                            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          }`}
                        >
                          {user.isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
                        </button>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}