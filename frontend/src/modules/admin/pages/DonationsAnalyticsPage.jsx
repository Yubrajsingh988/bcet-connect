// import { useEffect, useState } from "react";
// import donationService from "@/services/donationService";

// export default function DonationsAnalyticsPage() {
//   const [stats, setStats] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await donationService.getStats();
//         setStats(res.data.data);
//       } catch (err) {
//         console.error("Failed to load donation stats", err);
//       }
//     };

//     load();
//   }, []);

//   return (
//     <div className="p-6 space-y-4">
//       <h1 className="text-2xl font-bold">📊 Donation Analytics (Admin)</h1>
//       <p className="text-gray-500">
//         Overview of alumni contribution, purpose distribution & trends.
//       </p>

//       {!stats && (
//         <p className="text-gray-400 text-sm">Loading analytics...</p>
//       )}

//       {stats && (
//         <div className="grid gap-4 sm:grid-cols-3">
//           <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
//             <div className="text-xs text-gray-500 uppercase mb-1">
//               Total Amount
//             </div>
//             <div className="text-2xl font-bold text-green-600">
//               ₹{stats.totalAmount}
//             </div>
//           </div>

//           <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
//             <div className="text-xs text-gray-500 uppercase mb-1">
//               Total Donations
//             </div>
//             <div className="text-2xl font-bold">
//               {stats.totalDonations}
//             </div>
//           </div>

//           <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
//             <div className="text-xs text-gray-500 uppercase mb-1">
//               Purposes
//             </div>
//             <div className="text-sm text-gray-600 dark:text-gray-300">
//               {stats.byPurpose?.map((p) => p.purpose || p._id).join(", ") ||
//                 "—"}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
