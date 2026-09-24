import PaymentOrderDetailPage from "@/components/admin/admin-order-detail"

export default async function AdminWithdrawalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PaymentOrderDetailPage id={Number(id)} />
}
