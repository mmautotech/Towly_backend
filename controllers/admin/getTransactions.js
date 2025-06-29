const mongoose = require("mongoose");
const Transaction = require("../../models/finance/transaction.schema");

module.exports = async function getTransactions(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only." });
    }

    const {
      user_id,
      searchTerm,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    // Filter by user_id
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({ message: "Invalid user_id format" });
      }
      filter.user_id = user_id;
    }

    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Status filter
    if (status && status !== "All") {
      filter.status = status;
    }

    // Base query with population
    let transactionsQuery = Transaction.find(filter)

      
      .populate({
        path: "user_id",
        select: "user_name email phone role",
      })
      .populate({
        path: "wallet_id",
        select: "balance currency",
      })
      .sort({ createdAt: -1 });

    let transactions = await transactionsQuery.lean();

    // Search term filtering (manual on populated fields)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      transactions = transactions.filter(tx => {
        const u = tx.user_id;
        return (
          u?.user_name?.toLowerCase().includes(search) ||
          u?.email?.toLowerCase().includes(search) ||
          u?.phone?.includes(search)
        );
      });
    }

    return res.status(200).json({
      total: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
};
