import { NextRequest } from "next/server";

import { processScheduledJobsAutomation } from "@/features/delivery/data/delivery-service";
import {
  automationFailureResponse,
  automationSuccessResponse,
  automationUnauthorizedResponse,
  isAuthorizedAutomationRequest,
  readAutomationLimit
} from "@/lib/automation/route";

export async function POST(request: NextRequest) {
  if (!isAuthorizedAutomationRequest(request)) {
    return automationUnauthorizedResponse();
  }

  try {
    const summary = await processScheduledJobsAutomation(readAutomationLimit(request));

    return automationSuccessResponse(summary);
  } catch (error) {
    return automationFailureResponse(error, "Unable to process scheduled jobs.");
  }
}
