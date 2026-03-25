import { NextRequest } from "next/server";

import { processOperationEscalationRulesAutomation } from "@/features/operations/data/operations-service";
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
    const summary = await processOperationEscalationRulesAutomation(
      readAutomationLimit(request)
    );

    return automationSuccessResponse(summary);
  } catch (error) {
    return automationFailureResponse(error, "Unable to process escalation rules.");
  }
}
