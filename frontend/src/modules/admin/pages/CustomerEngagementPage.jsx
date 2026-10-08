import React, { useState, useEffect } from 'react';
import {
   Ticket,
   MessageSquare,
   Users,
   Percent,
   ChevronRight,
   Search,
   Filter,
   CheckCircle2,
   Clock,
   Plus,
   Eye,
   Mail,
   Zap,
   Star
} from 'lucide-react';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { motion } from 'framer-motion';
import { useAdminDataStore } from '../store/adminDataStore';

export default function CustomerEngagementPage() {
   const {
      tickets: allTickets,
      promos: allPromos,
      campaigns: allCampaigns,
      engagementStats,
      fetchEngagementData,
      fetchCampaigns,
      addCampaign
   } = useAdminDataStore();

   const [activeTab, setActiveTab] = useState('tickets');
   const [activeFilters, setActiveFilters] = useState({ range: 'Last 7 Days' });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newCampaign, setNewCampaign] = useState({ name: '', campaignId: '' });

   useEffect(() => {
      fetchEngagementData(activeFilters);
      fetchCampaigns(activeFilters);
   }, []);

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchEngagementData(newFilters);
      console.log('Customer Engagement Sync:', newFilters);
   };

   const handleAddCampaign = async (e) => {
      e.preventDefault();
      if (!newCampaign.name || !newCampaign.campaignId) return;

      await addCampaign(newCampaign);
      setNewCampaign({ name: '', campaignId: '' });
      setIsModalOpen(false);
   };

   return (
      <div className="space-y-6 pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Support & <span className="text-emerald-500">Service</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Ticket Desk & Campaign Hub
               </p>
            </div>

            <div className="flex items-center gap-2">
               <OpsFilter onFilterChange={handleFilterChange} />
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
               >
                  <Plus size={12} /> New Campaign
               </button>
            </div>
         </div>

         {/* KPI Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminStatCard title="Open Tickets" value={engagementStats.openTickets} icon={MessageSquare} color="amber" subtitle="Pending Alpha" />
            <AdminStatCard title="Live Promo" value={engagementStats.livePromos} icon={Ticket} color="emerald" subtitle="Active Nodes" />
            <AdminStatCard title="CSAT Score" value={engagementStats.csatScore} icon={Star} color="blue" subtitle="Satisfaction Index" />
         </div>

         {/* Tabbed Navigation */}
         <div className="flex border-b border-[var(--border-subtle)] gap-6">
            {['tickets', 'coupons', 'crm', 'feedback'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 text-[9px] font-black uppercase tracking-widest transition-all relative italic ${activeTab === tab ? 'text-emerald-500' : 'text-[var(--text-tertiary)] hover:text-emerald-500'
                     }`}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div layoutId="engagement-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  )}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 gap-6">
            {/* Main Content Area based on Tab */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
               <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
                  <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">
                     {activeTab === 'tickets' ? 'Support Payload Registry' :
                        activeTab === 'coupons' ? 'Active Promo Code Registry' :
                           activeTab === 'crm' ? 'Master Campaign Registry' : 'User Feedback Registry'}
                  </h3>
                  <div className="relative group">
                     <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors" />
                     <input
                        type="text"
                        placeholder="Quick Search..."
                        className="pl-8 pr-3 py-1.5 bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] rounded-lg text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none w-32 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]/50"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                           {activeTab === 'tickets' ? (
                              ['ID', 'Entity', 'Category', 'Priority', 'SLA', 'Status'].map((header) => (
                                 <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                              ))
                           ) : activeTab === 'coupons' ? (
                              ['Code', 'Value', 'Usage', 'Expiry', 'Status'].map((header) => (
                                 <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                              ))
                           ) : activeTab === 'crm' ? (
                              ['Campaign ID', 'Name', 'Reach', 'Nodes', 'Status'].map((header) => (
                                 <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                              ))
                           ) : (
                              ['User', 'Rating', 'Comment', 'Sync', 'Status'].map((header) => (
                                 <th key={header} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                              ))
                           )}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border-subtle)]">
                        {activeTab === 'tickets' ? (
                           allTickets.map((tck) => (
                              // ... (existing ticket row)
                              <tr key={tck.id} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                                 <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{tck.id}</td>
                                 <td className="py-2 px-4 whitespace-nowrap">
                                    <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{tck.entity}</span>
                                 </td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{tck.category}</td>
                                 <td className="py-2 px-4">
                                    <span className={` font-medium  px-1.5 py-0.5 rounded border  ${tck.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' :
                                       tck.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                                          'bg-blue-500/10 text-blue-500 border-blue-500/10'
                                       }`}>
                                       {tck.priority}
                                    </span>
                                 </td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{new Date(tck.sla).toLocaleDateString()}</td>
                                 <td className="py-2 px-4">
                                    <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${tck.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                                       tck.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                                          'bg-rose-500/10 text-rose-500 border-rose-500/10'
                                       }`}>
                                       {tck.status}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        ) : activeTab === 'coupons' ? (
                           allPromos.map((cp) => (
                              <tr key={cp.code} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                                 <td className="py-2 px-4 font-medium  text-emerald-500">{cp.code}</td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-primary)]">{cp.discount}</td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{cp.usage} Vol</td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{cp.expiry}</td>
                                 <td className="py-2 px-4">
                                    <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${cp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                                       }`}>
                                       {cp.status}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        ) : activeTab === 'crm' ? (
                           allCampaigns.map((camp) => (
                              <tr key={camp._id || camp.campaignId} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                                 <td className="py-2 px-4 font-medium  text-[var(--text-tertiary)]">{camp.campaignId}</td>
                                 <td className="py-2 px-4">
                                    <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{camp.name}</span>
                                 </td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{camp.usageCount || 0} Users</td>
                                 <td className="py-2 px-4  font-medium text-[var(--text-tertiary)]">{camp.targetNodes || 0} Nodes</td>
                                 <td className="py-2 px-4">
                                    <div className={`inline-flex px-1.5 py-0.5 rounded  font-medium   border  ${camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                                       }`}>
                                       {camp.status}
                                    </div>
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">
                              <td colSpan="5" className="py-10  font-medium text-[var(--text-tertiary)]  tracking-[0.2em]">No Data Stream Available</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         <CampaignModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddCampaign}
            newCampaign={newCampaign}
            setNewCampaign={setNewCampaign}
         />
      </div>
   );
}

// Campaign Modal Implementation
import { X, Zap as ZapIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

function CampaignModal({ isOpen, onClose, onSave, newCampaign, setNewCampaign }) {
   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
               >
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                           New Campaign <span className="text-emerald-500">Initiator</span>
                        </h2>
                        <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">SECTION: ENGAGEMENT_HUB_V1</p>
                     </div>
                     <button onClick={onClose} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                        <X size={18} />
                     </button>
                  </div>

                  <form onSubmit={onSave} className="space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Campaign Name</label>
                           <input
                              autoFocus
                              value={newCampaign.name}
                              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                              placeholder="e.g. Summer Blitz 2024"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Campaign Identifier</label>
                           <input
                              value={newCampaign.campaignId}
                              onChange={(e) => setNewCampaign({ ...newCampaign, campaignId: e.target.value })}
                              placeholder="e.g. SUM-BLITZ-001"
                              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all italic"
                           />
                        </div>
                     </div>
                     <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                        <ZapIcon size={14} fill="white" /> Execute Campaign Sync
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
}
