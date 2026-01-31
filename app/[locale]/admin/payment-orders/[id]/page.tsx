import PaymentOrderDetailPage from "@/components/admin/admin-order-detail"

export default function AdminWithdrawalsPage({ params }: { params: { id: number } }) {
  return <PaymentOrderDetailPage id={params.id} />
}