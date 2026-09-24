import UpdatePaymentOrderPage from "@/components/admin/admin-update-order-status";

export default async function AdminWithdrawalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UpdatePaymentOrderPage orderId={Number(id)} />
}
