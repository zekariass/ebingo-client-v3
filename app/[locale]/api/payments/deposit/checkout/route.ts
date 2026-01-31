// import { NextRequest, NextResponse } from "next/server";
// import type { ApiResponse } from "@/lib/backend/types";
// import { message } from "telegraf/filters";

// const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

// /**
//  * POST /[lang]/api/payments/checkout
//  * Body: {
//  *   paymentOrderData: {
//  *     providerUuid: string;
//  *     amount: number;
//  *     checkData: {
//  *       data: {
//  *         phone_number: string;
//  *         merchant_name: string;
//  *       };
//  *     };
//  *   };
//  *   selectedMethod: {
//  *     name: string;
//  *     service: string;
//  *   };
//  * }
//  */
// export async function POST(req: NextRequest) {
//   try {
//     if (!BACKEND_BASE_URL) {
//       throw new Error("BACKEND_BASE_URL is not defined");
//     }

//     const initData = req.headers.get("x-init-data");
//     if (!initData) {
//       return NextResponse.json(
//         { success: false, error: "Missing x-init-data header" },
//         { status: 400 }
//       );
//     }

//     // Parse and validate request body
//     const body = await req.json();
//     // const { paymentOrderData, selectedMethod } = body;

//     // if (!paymentOrderData || !selectedMethod) {
//     //   return NextResponse.json(
//     //     { success: false, error: "Missing paymentOrderData or selectedMethod" },
//     //     { status: 400 }
//     //   );
//     // }

//     // Construct the payload required by backend
//     // const payload = {
//     //   uuid: body.providerUuid,
//     //   phone_number: body.checkData?.data?.phone_number,
//     //   encrypted_total_amount: body.amount,
//     //   merchant_name: body.checkData?.data?.merchant_name,
//     //   selected_service: body.service,
//     //   selected_bank: body.name,
//     // };

//     // Validate required fields
//     // if (
//     //   !payload.uuid ||
//     //   !payload.phone_number ||
//     //   !payload.encrypted_total_amount ||
//     //   !payload.merchant_name ||
//     //   !payload.selected_service ||
//     //   !payload.selected_bank
//     // ) {
//     //   return NextResponse.json(
//     //     { success: false, error: "Incomplete checkout data" },
//     //     { status: 400 }
//     //   );
//     // }

//     // Forward to backend checkout endpoint
//     const response = await fetch(
//       `${BACKEND_BASE_URL}/api/v1/secured/payments/order/initiate`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-init-data": initData,
//         },
//         body: JSON.stringify(body),
//       }
//     );

//     const result = await response.json();

//     if (!response.ok) {
//     console.log("====================================>>>>: ", result)

//       return NextResponse.json(
//         { success: false, 
//           error: result?.error || "Backend checkout failed" },
//         { status: response.status }
//       );
//     }



//     const responseData: ApiResponse = {
//       success: true,
//       data: result.data,
//       error: null,
//     };


//     return NextResponse.json(responseData, { status: 200 });
//   } catch (error) {
//     console.error("Checkout route error:", error);
//     const response: ApiResponse = {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//     return NextResponse.json(response, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/backend/types";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_BASE_URL) {
      throw new Error("BACKEND_BASE_URL is not defined");
    }

    const initData = req.headers.get("x-init-data");
    if (!initData) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Missing x-init-data header" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Forward the request to backend
    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}/api/v1/secured/payments/order/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-init-data": initData,
        },
        body: JSON.stringify(body),
      }
    );

    const result = await backendResponse.json();

    console.log("====================================>>>>: ", result)

    // Handle backend errors gracefully
    if (!backendResponse.ok || result.success === false) {
      console.error("Backend checkout failed:", result);

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          status: result.statusCode || backendResponse.status,
          message:
            result.message ||
            result.error ||
            "Failed to complete checkout (backend error)",
          error: result.error || "Internal Server Error",
          data: result.data || null,
        },
        { status: backendResponse.status }
      );
    }

    // Successful response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        status: 200,
        message: result.message || "Checkout successful",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout route error:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error during checkout",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
