"use client";

import { useEffect, useState } from "react";
import { Trophy, ChevronDown, ChevronUp, ArrowLeftIcon } from "lucide-react";
import { useAdminStore } from "@/lib/stores/admin-store";
import Link from "next/link";
import { useAgentStore } from "@/lib/stores/agent-store";
import i18n from "@/i18n";

const trophyColors = ["text-yellow-400", "text-gray-400", "text-orange-500"];
const top3BgColors = ["bg-yellow-900/40", "bg-gray-700/50", "bg-orange-900/40"];

const TotalLeaderboardPage = () => {
  const { activeAgentId } = useAgentStore();
  const {
    totalLeaderboard,
    totalLeaderboardLoading,
    totalLeaderboardPage,
    totalLeaderboardTotalPages,
    fetchTotalLeaderboard,
  } = useAdminStore();

  const [sortBy, setSortBy] = useState("totalWins");
  const [includeBots, setIncludeBots] = useState(false);

  // Track which rows are expanded (number IDs)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (activeAgentId) {
      fetchTotalLeaderboard(activeAgentId, 0, 10, sortBy, includeBots);
    }
  }, [sortBy, includeBots, activeAgentId]);

  const handlePageChange = (newPage: number) => {
    if (activeAgentId && newPage >= 0 && newPage < totalLeaderboardTotalPages) {
      fetchTotalLeaderboard(activeAgentId, newPage, 10, sortBy, includeBots);
      setExpandedRows(new Set()); // collapse all rows on page change
    }
  };

  const toggleRow = (id: number) => {
    const newSet = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  return (
    <div className="p-4 bg-[var(--background)] min-h-screen text-white">
      <Link
        href={`/${i18n.language}/admin/rooms?agentId=${activeAgentId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back To Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-4 text-center">Total Leaderboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-[var(--card)] text-white rounded"
        >
          <option value="totalWins">Wins</option>
          <option value="totalPrize">Prize</option>
          <option value="totalBets">Bets</option>
          <option value="totalGamesPlayed">Total Games Played</option>
          <option value="totalDeposit">Total Deposit</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeBots}
            onChange={(e) => setIncludeBots(e.target.checked)}
            className="accent-yellow-400"
          />
          Include Bots
        </label>
      </div>

      {totalLeaderboardLoading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          Loading...
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {totalLeaderboard.map((player, idx) => {
            const rowId = player.id; // number ID
            const isExpanded = expandedRows.has(rowId);

            return (
              <div
                key={rowId}
                className={`rounded-xl shadow ${
                  idx < 3 ? top3BgColors[idx] : "bg-gray-800"
                }`}
              >
                {/* Row header */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleRow(rowId)}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {idx < 3 && (
                      <Trophy
                        className={`w-6 h-6 ${trophyColors[idx]} animate-bounce`}
                      />
                    )}
                    {player.userProfile?.nickname ||
                      `${player.userProfile?.firstName ?? ""} ${player.userProfile?.lastName ?? ""}`.trim() ||
                      "Unknown Player"}
                    {player.isBot && <span className="ml-1 text-gray-400">(Bot)</span>}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>

                {/* Accordion content */}
                {/* {isExpanded && (
                  <div className="px-4 pb-3 text-sm text-gray-200">
                    <div>Phone: {player.userProfile.phoneNumber || "-"}</div>
                    <div>Total Wins: {player.totalWins}</div>
                    <div>Total Prize: {player.totalPrize}</div>
                    <div>Total Bets: {player.totalBets}</div>
                    <div>Total Games Played: {player.totalGamesPlayed}</div>
                    <div>Total Deposit: {player.totalDeposit}</div>
                  </div>
                )} */}

                {isExpanded && (
                    <div className="px-4 pb-4 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3">

                        {/* Phone */}
                        <div className="premium-card">
                            <div className="icon-wrap">
                            📞
                            </div>
                            <div className="label">Phone</div>
                            <div className="value">{player.userProfile?.phoneNumber || "-"}</div>
                        </div>

                        {/* Wins */}
                        <div className="premium-card">
                            <div className="icon-wrap bg-green-500/20 text-green-400">
                            🏆
                            </div>
                            <div className="label">Total Wins</div>
                            <div className="value">{player.totalWins}</div>
                        </div>

                        {/* Prize */}
                        <div className="premium-card">
                            <div className="icon-wrap bg-yellow-500/20 text-yellow-300">
                            💰
                            </div>
                            <div className="label">Total Prize</div>
                            <div className="value">{player.totalPrize}</div>
                        </div>

                        {/* Bets */}
                        <div className="premium-card">
                            <div className="icon-wrap bg-blue-500/20 text-blue-300">
                            🎲
                            </div>
                            <div className="label">Total Bets</div>
                            <div className="value">{player.totalBets}</div>
                        </div>

                        {/* Games Played */}
                        <div className="premium-card">
                            <div className="icon-wrap bg-purple-500/20 text-purple-300">
                            🎮
                            </div>
                            <div className="label">Games Played</div>
                            <div className="value">{player.totalGamesPlayed}</div>
                        </div>

                        {/* Deposit */}
                        <div className="premium-card">
                            <div className="icon-wrap bg-orange-500/20 text-orange-300">
                            💵
                            </div>
                            <div className="label">Total Deposit</div>
                            <div className="value">{player.totalDeposit}</div>
                        </div>

                        </div>
                    </div>
                    )}

              </div>
            );
          })}

          {totalLeaderboard.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No leaderboard data found
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 px-2">
            <button
              onClick={() => handlePageChange(totalLeaderboardPage - 1)}
              disabled={totalLeaderboardPage === 0}
              className="px-4 py-2 bg-[var(--btn-default-bg)] rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {totalLeaderboardPage + 1} of {Math.max(1, totalLeaderboardTotalPages)}
            </span>
            <button
              onClick={() => handlePageChange(totalLeaderboardPage + 1)}
              disabled={totalLeaderboardPage >= totalLeaderboardTotalPages - 1}
              className="px-4 py-2 bg-[var(--btn-default-bg)] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalLeaderboardPage;
