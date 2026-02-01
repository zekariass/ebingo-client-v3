"use client";

import { act, useState } from "react";
import { useAdminStore } from "@/lib/stores/admin-store";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useAgentStore } from "@/lib/stores/agent-store";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export default function WalletDetailsPage() {
  const { activeAgentId, agentDetails } = useAgentStore();
  const {
    fetchWalletDetails,
    WalletDetails,
    isLoading,
    error,
    addPromoBonus,
    addDeposit,
  } = useAdminStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [promoAmount, setPromoAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [txnRef, setTxnRef] = useState("");

  const handleFetch = async () => {
    if (!phoneNumber.trim()) return;
    await fetchWalletDetails(phoneNumber.trim(), activeAgentId!);
  };

  const handleOfferPromo = async () => {
    if (!promoAmount || isNaN(Number(promoAmount))) return;

    if (WalletDetails) {
      await addPromoBonus(
        activeAgentId!,
        WalletDetails.userProfile.telegramId,
        Number(promoAmount)
      );
      setShowPromoModal(false);
      setPromoAmount("");

      await fetchWalletDetails(WalletDetails.userProfile.phoneNumber, activeAgentId!);
    }
  };

  const handleAddDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;

    if (WalletDetails) {
      await addDeposit(activeAgentId!, WalletDetails.userProfile.telegramId, Number(depositAmount), txnRef);
      setShowDepositModal(false);
      setDepositAmount("");
      setTxnRef("");

      await fetchWalletDetails(WalletDetails.userProfile.phoneNumber, activeAgentId!);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white p-6">
      <Link
        href={`/admin/rooms?agentId=${activeAgentId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back To Dashboard
    </Link>
      <h1 className="text-3xl font-bold mb-6">Wallet Details</h1>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="px-4 py-2 rounded bg-[var(--card)] text-white w-full sm:w-auto flex-1"
        />

        <Button
          onClick={handleFetch}
          className="px-4 py-2 text-black rounded"
        >
          Fetch
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-gray-400 py-4">Fetching wallet details...</div>
      )}

      {/* Error */}
      {error && <div className="text-red-400 py-2">{error}</div>}

      {/* WALLET DETAILS FOUND */}
      {WalletDetails && typeof WalletDetails !== "number" && (
        <div className="space-y-6">

          {/* USER PROFILE CARD */}
          <div className="bg-[var(--card)] rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">User Profile</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileItem label="ID" value={WalletDetails.userProfile.id} />
              <ProfileItem label="Telegram ID" value={WalletDetails.userProfile.telegramId} />
              <ProfileItem label="Nickname" value={WalletDetails.userProfile.nickname} />
              <ProfileItem
                label="Full Name"
                value={`${WalletDetails.userProfile.firstName} ${WalletDetails.userProfile.lastName}`}
              />
              <ProfileItem label="Phone" value={WalletDetails.userProfile.phoneNumber} />
              <ProfileItem
                label="Is Bot"
                value={WalletDetails.userProfile.isBot ? "Yes" : "No"}
              />
            </div>
          </div>

          {/* WALLET INFORMATION CARD */}
          <div className="bg-[var(--card)] rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Item label="Welcome Bonus" value={WalletDetails.welcomeBonus} />
              <Item
                label="Available Welcome Bonus"
                value={WalletDetails.availableWelcomeBonus}
              />

              <Item label="Referral Bonus" value={WalletDetails.referralBonus} />
              <Item
                label="Available Referral Bonus"
                value={WalletDetails.availableReferralBonus}
              />

              <Item
                label="Total Prize Amount"
                value={WalletDetails.totalPrizeAmount}
              />
              <Item
                label="Pending Withdrawal"
                value={WalletDetails.pendingWithdrawal}
              />

              <Item
                label="Total Available Balance"
                value={WalletDetails.totalAvailableBalance}
              />
              <Item
                label="Available to Withdraw"
                value={WalletDetails.availableToWithdraw}
              />

              <Item label="Locked Amount" value={WalletDetails.lockedAmount} />
              <Item label="Deposit Bonus" value={WalletDetails.depositBonus} />

              <Item
                label="Promotional Bonus"
                value={WalletDetails.promotionalBonus}
              />

              <Item
                label="Last Payment From"
                value={WalletDetails.lastPaymentFrom || "-"}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-4">
              {agentDetails?.isMaster && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="px-4 py-2 rounded-lg bg-[var(--btn-default-bg)] hover:bg-blue-500"
                >
                  Add Promo Bonus
                </button>
              )}

              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 py-2 rounded-lg bg-[var(--btn-default-bg)]/80 hover:bg-green-500"
              >
                Add Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEFAULT MESSAGE */}
      {!isLoading && !WalletDetails && !error && (
        <div className="text-gray-500 py-4">
          Enter a phone number and click Fetch.
        </div>
      )}

      {/* MODALS */}
      {showPromoModal && (
        <Modal
          title="Add Promo Bonus"
          amount={promoAmount}
          txnRef={undefined}
          setAmount={setPromoAmount}
          setTxnRef={() => {}}
          addRefField={false}
          onCancel={() => setShowPromoModal(false)}
          onSubmit={handleOfferPromo}
          color="blue"
        />
      )}

      {showDepositModal && (
        <Modal
          title="Add Manual Deposit"
          amount={depositAmount}
          txnRef={txnRef}
          addRefField={true}
          setAmount={setDepositAmount}
          setTxnRef={setTxnRef}
          onCancel={() => setShowDepositModal(false)}
          onSubmit={handleAddDeposit}
          color="green"
        />
      )}
    </div>
  );
}

/* ---------------------------------------- */
/* Helper Components */
/* ---------------------------------------- */

function Item({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-gray-700 pb-2">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <span className="font-medium">{label}:</span> {value}
    </div>
  );
}

function Modal({
  title,
  amount,
  txnRef,
  setAmount,
  setTxnRef,
  addRefField,
  onCancel,
  onSubmit,
  color,
}: {
  title: string;
  amount: string;
  txnRef: string | undefined;
  setAmount: (v: string) => void;
  setTxnRef: (v: string) => void;
  addRefField: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  color: "blue" | "green";
}) {
  const colorMap = {
    blue: {
      ring: "focus:ring-blue-400",
      btn: "bg-blue-500 hover:bg-blue-400",
      border: "border-blue-500",
    },
    green: {
      ring: "focus:ring-green-400",
      btn: "bg-green-500 hover:bg-green-400",
      border: "border-green-500",
    },
  };

  const c = colorMap[color];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="p-2">
        <div className={`p-6 rounded-xl shadow-xl w-80 border ${c.border}`}>
          <h3 className="text-xl font-semibold mb-4">{title}</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(); // your existing submit handler
            }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className={`w-full px-4 py-2 mb-4 bg-[var(--background)] rounded-lg outline-none focus:ring-2 ${c.ring}`}
              required
            />

            {addRefField && (
              <input
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="Enter Txn Ref"
                className={`w-full px-4 py-2 mb-4 bg-[var(--background)] rounded-lg outline-none focus:ring-2 ${c.ring}`}
                required
              />
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg ${c.btn}`}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );

}
