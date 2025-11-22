// // frontend/src/services/donationService.js
// import apiClient from "./apiClient";

// const donationService = {
//   // Alumni create donation intent / record
//   createDonation(payload) {
//     // backend: POST /api/donations
//     return apiClient.post("/donations", payload);
//   },

//   // Logged-in alumni → "My donations"
//   getMyDonations(params = {}) {
//     return apiClient.get("/donations/me", { params });
//   },

//   // Admin → all donations
//   getAllDonations(params = {}) {
//     return apiClient.get("/donations", { params });
//   },

//   // Public leaderboard
//   getLeaderboard(limit = 10) {
//     return apiClient.get("/donations/leaderboard", {
//       params: { limit },
//     });
//   },

//   // Admin stats
//   getStats(params = {}) {
//     return apiClient.get("/donations/stats", { params });
//   },
// };

// export default donationService;
