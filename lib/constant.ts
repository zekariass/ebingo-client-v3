export const currency = "Birr"

// lib/constants.ts

export function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800"
    case "AWAITING_APPROVAL":
      return "bg-orange-100 text-orange-800"
    case "COMPLETED":
      return "bg-green-100 text-green-800"
    case "FAILED":
      return "bg-red-100 text-red-800"
    case "CANCELLED":
    case "REJECTED":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
