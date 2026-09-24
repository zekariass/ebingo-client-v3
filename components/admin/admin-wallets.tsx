"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/lib/stores/admin-store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeftIcon,
  Gift,
  Loader2,
  PlusCircle,
  Search,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/stores/agent-store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "@/lib/utils";
import i18n from "@/i18n";

export default function WalletDetailsPage() {
  const { activeAgentId, agentDetails, setActiveAgentId } = useAgentStore();
  const searchParams = useSearchParams();
  const agentId = Number(searchParams.get("agentId")) || activeAgentId;

  const {
    fetchWalletDetails,
    WalletDetails,
    isLoading,
    error,
    addPromoBonus,
    addDeposit,
  } = useAdminStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [promoAmount, setPromoAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urlAgentId = Number(searchParams.get("agentId"));
    if (urlAgentId && urlAgentId !== activeAgentId) {
      setActiveAgentId(urlAgentId);
    }
  }, [searchParams, activeAgentId, setActiveAgentId]);

  const handleFetch = async () => {
    const phone = phoneNumber.trim();
    if (!phone || !agentId) return;
    setSearchedPhone(phone);
    await fetchWalletDetails(phone, agentId);
  };

  const refetch = async () => {
    if (searchedPhone && agentId) {
      await fetchWalletDetails(searchedPhone, agentId);
    }
  };

  const handleOfferPromo = async () => {
    const amount = Number(promoAmount);
    if (!promoAmount || isNaN(amount) || amount <= 0 || !agentId || !WalletDetails) return;

    setSubmitting(true);
    const ok = await addPromoBonus(agentId, WalletDetails.userProfile.telegramId, amount);
    setSubmitting(false);

    if (!ok) {
      toast.error(useAdminStore.getState().error || "Failed to add promotional bonus");
      return;
    }

    toast.success(`Added ${amount} promotional bonus`);
    setShowPromoModal(false);
    setPromoAmount("");
    await refetch();
  };

  const handleAddDeposit = async () => {
    const amount = Number(depositAmount);
    if (
      !depositAmount ||
      isNaN(amount) ||
      amount <= 0 ||
      !txnRef.trim() ||
      !agentId ||
      !WalletDetails
    )
      return;

    setSubmitting(true);
    const ok = await addDeposit(
      agentId,
      WalletDetails.userProfile.telegramId,
      amount,
      txnRef.trim()
    );
    setSubmitting(false);

    if (!ok) {
      toast.error(useAdminStore.getState().error || "Failed to record deposit");
      return;
    }

    toast.success(`Recorded deposit of ${amount}`);
    setShowDepositModal(false);
    setDepositAmount("");
    setTxnRef("");
    await refetch();
  };

  const wallet = WalletDetails;
  const profile = wallet?.userProfile;
  const showInitialSkeleton = isLoading && !wallet;

  return (
    <div className="w-full px-3 sm:px-4 py-4 space-y-4 max-w-7xl mx-auto">
      <Link
        href={`/${i18n.language}/admin/rooms?agentId=${agentId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back To Dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Wallet Details</h1>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFetch();
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <Input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          className="flex-1 sm:max-w-sm"
        />
        <Button type="submit" disabled={isLoading || !phoneNumber.trim()}>
          {isLoading && !wallet ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>

      {/* Loading */}
      {showInitialSkeleton && (
        <div className="space-y-4">
          <Card className="p-4 sm:p-5 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-56" />
          </Card>
          {[0, 1].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !showInitialSkeleton && !wallet && (
        <Card className="py-10 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="font-medium text-gray-600 dark:text-gray-300">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !wallet && !error && (
        <Card className="py-12 flex flex-col items-center gap-3 text-center">
          <Wallet className="w-10 h-10 text-gray-400" />
          <p className="font-medium text-gray-600 dark:text-gray-300">No wallet loaded</p>
          <p className="text-sm text-gray-400">
            Enter a phone number above and click Search.
          </p>
        </Card>
      )}

      {wallet && (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                {profile?.firstName} {profile?.lastName}
                {profile?.nickname ? (
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    {" "}
                    (@{profile.nickname})
                  </span>
                ) : null}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.phoneNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Balance
              </p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                {wallet.totalAvailableBalance}
              </p>
            </div>
          </Card>

          {/* User profile */}
          <SectionCard icon={User} title="User Profile">
            <DetailItem label="ID" value={profile?.id} />
            <DetailItem label="Telegram ID" value={profile?.telegramId} mono />
            <DetailItem label="Nickname" value={profile?.nickname} />
            <DetailItem
              label="Full Name"
              value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "-"}
            />
            <DetailItem label="Phone" value={profile?.phoneNumber} />
            <DetailItem label="Is Bot" value={profile?.isBot ? "Yes" : "No"} />
          </SectionCard>

          {/* Wallet info */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-2 py-3 border-b border-gray-100 dark:border-gray-800">
              <Wallet className="w-4 h-4 text-blue-500" />
              <CardTitle className="text-base">Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-2">
              <DetailItem
                label="Total Available Balance"
                value={<span className="font-semibold">{wallet.totalAvailableBalance}</span>}
              />
              <DetailItem label="Available to Withdraw" value={wallet.availableToWithdraw} />
              <DetailItem label="Pending Withdrawal" value={wallet.pendingWithdrawal} />
              <DetailItem label="Locked Amount" value={wallet.lockedAmount} />
              <DetailItem label="Welcome Bonus" value={wallet.welcomeBonus} />
              <DetailItem
                label="Available Welcome Bonus"
                value={wallet.availableWelcomeBonus}
              />
              <DetailItem label="Referral Bonus" value={wallet.referralBonus} />
              <DetailItem
                label="Available Referral Bonus"
                value={wallet.availableReferralBonus}
              />
              <DetailItem label="Total Prize Amount" value={wallet.totalPrizeAmount} />
              <DetailItem label="Deposit Bonus" value={wallet.depositBonus} />
              <DetailItem label="Promotional Bonus" value={wallet.promotionalBonus} />
              <DetailItem label="Last Payment From" value={wallet.lastPaymentFrom || "-"} />
            </CardContent>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              {agentDetails?.isMaster && (
                <Button variant="outline" onClick={() => setShowPromoModal(true)}>
                  <Gift className="h-4 w-4 mr-2" />
                  Add Promo Bonus
                </Button>
              )}
              <Button onClick={() => setShowDepositModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Deposit
              </Button>
              {isLoading && (
                <span className="inline-flex items-center text-sm text-gray-400 ml-auto">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing…
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Promo bonus dialog */}
      <Dialog
        open={showPromoModal}
        onOpenChange={(open) => {
          if (!submitting) setShowPromoModal(open);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Promo Bonus</DialogTitle>
            <DialogDescription>
              Credit a promotional bonus to {profile?.firstName} {profile?.lastName} (
              {profile?.phoneNumber}).
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOfferPromo();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="promo-amount">Amount</Label>
              <Input
                id="promo-amount"
                type="number"
                min="0"
                step="any"
                value={promoAmount}
                onChange={(e) => setPromoAmount(e.target.value)}
                placeholder="Enter amount"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPromoModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !promoAmount}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deposit dialog */}
      <Dialog
        open={showDepositModal}
        onOpenChange={(open) => {
          if (!submitting) setShowDepositModal(open);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Manual Deposit</DialogTitle>
            <DialogDescription>
              Record an offline deposit for {profile?.firstName} {profile?.lastName} (
              {profile?.phoneNumber}).
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddDeposit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="0"
                step="any"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="txn-ref">Transaction Reference</Label>
              <Input
                id="txn-ref"
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. bank slip / transfer ref"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDepositModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !depositAmount || !txnRef.trim()}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 py-3 border-b border-gray-100 dark:border-gray-800">
        <Icon className="w-4 h-4 text-blue-500" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-2">
        {children}
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-right break-all tabular-nums",
          mono && "font-mono text-xs sm:text-sm"
        )}
      >
        {value ?? "-"}
      </span>
    </div>
  );
}
