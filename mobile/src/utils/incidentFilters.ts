import { IncidentResponse, IncidentStatus, IncidentType } from '../types';

export function filterIncidents(
  incidents: IncidentResponse[],
  statusFilter: IncidentStatus | 'ALL',
  typeFilter: IncidentType | 'ALL',
  searchQuery: string,
): IncidentResponse[] {
  return incidents.filter((incident) => {
    if (statusFilter !== 'ALL' && incident.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && incident.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = incident.title.toLowerCase().includes(query);
      const matchesUser = incident.user?.name?.toLowerCase().includes(query) ?? false;
      const matchesEmail = incident.user?.email?.toLowerCase().includes(query) ?? false;
      if (!matchesTitle && !matchesUser && !matchesEmail) return false;
    }
    return true;
  });
}

export function computeSummary(incidents: IncidentResponse[]) {
  return {
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'OPEN').length,
    inProgress: incidents.filter((i) => i.status === 'IN_PROGRESS').length,
    resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
  };
}
