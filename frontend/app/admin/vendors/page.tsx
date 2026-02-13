"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { ShoppingBag, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  kycStatus?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  rating?: number;
}

interface VendorWithStats extends Vendor {
  stats?: VendorStats;
}

export default function AdminVendorsList() {
  const [vendors, setVendors] = useState<VendorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState<Record<string, VendorStats>>({});

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vendors');
      const vendorList = res.data.data || [];
      setVendors(vendorList);
      
      // Fetch stats for each vendor
      for (const vendor of vendorList) {
        if (vendor.kycStatus === 'APPROVED') {
          try {
            const statsRes = await api.get(`/admin/vendors/${vendor.id}/stats`);
            setVendorStats(prev => ({
              ...prev,
              [vendor.id]: statsRes.data?.data || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
            }));
          } catch (err) {
            // Fallback if stats endpoint doesn't exist
            setVendorStats(prev => ({
              ...prev,
              [vendor.id]: { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
            }));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadVendors();
  }, []);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadVendors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const updateKyc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.patch(`/admin/vendors/${id}/kyc`, { kycStatus: status });
      const updated = res.data.data;
      
      // Ensure kycStatus is properly set
      const updatedVendor = { ...updated, kycStatus: status };
      setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
      
      // Trigger toast notification
      sessionStorage.setItem("adminNotification", JSON.stringify({
        type: 'success',
        message: `Vendor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      }));

      // Force refresh from server after a short delay
      setTimeout(() => loadVendors(), 500);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to update vendor';
      sessionStorage.setItem("adminNotification", JSON.stringify({
        type: 'error',
        message,
      }));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading vendors…</div>;

  // Separate vendors by status
  const pendingVendors = vendors.filter(v => !v.kycStatus || v.kycStatus === 'PENDING');
  const approvedVendors = vendors.filter(v => v.kycStatus === 'APPROVED');
  const rejectedVendors = vendors.filter(v => v.kycStatus === 'REJECTED');

  return (
    <div className="space-y-8">

      {/* ================= PENDING APPROVALS ================= */}
      {pendingVendors.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-yellow-500" />
            Pending Approval ({pendingVendors.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingVendors.map(v => (
              <div key={`${v.id}-pending`} className="bg-white border-l-4 border-yellow-400 rounded-lg p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{v.name}</h3>
                    <p className="text-xs text-gray-500">{v.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    PENDING
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Registered: {new Date(v.createdAt || '').toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => updateKyc(v.id, 'APPROVED')} 
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => updateKyc(v.id, 'REJECTED')} 
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= APPROVED VENDORS ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500" />
          Approved Vendors ({approvedVendors.length})
        </h2>

        {approvedVendors.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No approved vendors yet
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {approvedVendors.map(v => {
              const stats = vendorStats[v.id] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
              return (
                <div key={`${v.id}-approved`} className="bg-white border-l-4 border-green-400 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                  {/* HEADER */}
                  <div className="bg-gradient-to-r from-green-50 to-transparent p-5 border-b flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{v.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{v.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      APPROVED
                    </span>
                  </div>

                  {/* STATS */}
                  <div className="p-5 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center p-2 bg-blue-100 rounded-lg mb-2">
                        <ShoppingBag size={18} className="text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
                      <div className="text-xs text-gray-500">Total Orders</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center p-2 bg-green-100 rounded-lg mb-2">
                        <TrendingUp size={18} className="text-green-600" />
                      </div>
                      <div className="text-2xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Revenue</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center p-2 bg-purple-100 rounded-lg mb-2">
                        <TrendingUp size={18} className="text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold">₹{(stats.avgOrderValue || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Avg Order</div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="px-5 pb-5">
                    <Link 
                      href={`/admin/vendors/${v.id}`} 
                      className="w-full block text-center px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= REJECTED VENDORS ================= */}
      {rejectedVendors.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            Rejected Vendors ({rejectedVendors.length})
          </h2>

          <div className="space-y-2">
            {rejectedVendors.map(v => (
              <div key={`${v.id}-rejected`} className="bg-white border-l-4 border-red-400 rounded-lg p-4 flex justify-between items-center opacity-60">
                <div>
                  <div className="font-medium text-sm">{v.name}</div>
                  <div className="text-xs text-gray-500">{v.email}</div>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  REJECTED
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
