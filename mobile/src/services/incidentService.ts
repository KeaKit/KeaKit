import { API_ROUTES } from '../config/api';
import {
  IncidentCreateRequest,
  IncidentResponse,
  IncidentCommentResponse,
  IncidentCommentCreateRequest,
  RentedItemResponse,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;

    try {
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorMessage = await res.text();
      }
    } catch {
      // Si falla el parseo, usar el mensaje por defecto
    }

    throw new Error(errorMessage || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function getAllIncidents(
  token: string,
): Promise<IncidentResponse[]> {
  const res = await fetch(API_ROUTES.GET_ALL_INCIDENTS, {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<IncidentResponse[]>(res);
}

export async function getIncidentsByUser(
  userId: number,
  token: string,
): Promise<IncidentResponse[]> {
  const res = await fetch(API_ROUTES.GET_INCIDENTS_BY_USER(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<IncidentResponse[]>(res);
}

export async function getReceivedIncidents(
  ownerId: number,
  token: string,
): Promise<IncidentResponse[]> {
  const res = await fetch(API_ROUTES.GET_RECEIVED_INCIDENTS(ownerId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<IncidentResponse[]>(res);
}

export async function createIncident(
  data: IncidentCreateRequest,
  token: string,
): Promise<IncidentResponse> {
  const res = await fetch(API_ROUTES.CREATE_INCIDENT, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<IncidentResponse>(res);
}

export async function getIncidentById(
  id: number,
  token: string,
): Promise<IncidentResponse> {
  const res = await fetch(API_ROUTES.GET_INCIDENT(id), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<IncidentResponse>(res);
}

export async function updateIncident(
  id: number,
  data: Partial<IncidentCreateRequest>,
  token: string,
): Promise<IncidentResponse> {
  const res = await fetch(API_ROUTES.UPDATE_INCIDENT(id), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<IncidentResponse>(res);
}

export async function resolveIncident(
  id: number,
  token: string,
): Promise<IncidentResponse> {
  const res = await fetch(API_ROUTES.RESOLVE_INCIDENT(id), {
    method: 'PUT',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<IncidentResponse>(res);
}

export async function deleteIncident(
  id: number,
  token: string,
): Promise<void> {
  const res = await fetch(API_ROUTES.DELETE_INCIDENT(id), {
    method: 'DELETE',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorMessage = await res.text();
      }
    } catch {
      // usar mensaje por defecto
    }
    throw new Error(errorMessage);
  }
}

// --- Comentarios ---

export async function getIncidentComments(
  incidentId: number,
  token: string,
): Promise<IncidentCommentResponse[]> {
  const res = await fetch(API_ROUTES.GET_INCIDENT_COMMENTS(incidentId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<IncidentCommentResponse[]>(res);
}

export async function addIncidentComment(
  incidentId: number,
  data: IncidentCommentCreateRequest,
  token: string,
): Promise<IncidentCommentResponse> {
  const res = await fetch(API_ROUTES.ADD_INCIDENT_COMMENT(incidentId), {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<IncidentCommentResponse>(res);
}

// --- Objetos alquilados ---

export async function getRentedItems(
  userId: number,
  token: string,
): Promise<RentedItemResponse[]> {
  const res = await fetch(API_ROUTES.GET_RENTED_ITEMS(userId), {
    method: 'GET',
    headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
  });
  return handleResponse<RentedItemResponse[]>(res);
}
