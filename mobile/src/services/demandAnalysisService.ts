import { API_ROUTES } from "../config/api";
import { DemandAnalysisItem } from "../types";
import { fetchWithTimeout, handleResponse, jsonHeaders } from "./utils";

export async function getTopDemandedItems(
  token: string,
  limit = 5,
): Promise<DemandAnalysisItem[]> {
  const res = await fetchWithTimeout(API_ROUTES.DEMAND_ANALYSIS_TOP(limit), {
    method: "GET",
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });

  return handleResponse<DemandAnalysisItem[]>(res);
}
