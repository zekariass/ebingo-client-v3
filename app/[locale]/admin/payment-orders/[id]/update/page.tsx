import UpdatePaymentOrderPage from "@/components/admin/admin-update-order-status";

export default function AdminWithdrawalsPage({ params }: { params: { id: number } }) {
  return <UpdatePaymentOrderPage orderId={params.id} />
}