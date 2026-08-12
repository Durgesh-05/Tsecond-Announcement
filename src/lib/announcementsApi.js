import { apiClient } from './apiClient';

export async function fetchAnnouncements() {
  const res = await apiClient.get('/announcements');
  return res.data;
}

export async function fetchAnnouncementById(id) {
  const res = await apiClient.get(`/announcements/${id}`);
  return res.data;
}

export async function createAnnouncementApi(payload) {
  const res = await apiClient.post('/announcements', payload);
  return res.data;
}

export async function acknowledgeAnnouncementApi(id, { selfie, consent }) {
  const formData = new FormData();
  formData.append('selfie', selfie, 'selfie.jpg');
  formData.append('consent', String(consent));

  const res = await apiClient.post(`/announcements/${id}/acknowledge`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateAnnouncementStatusApi(id, payload) {
  const res = await apiClient.patch(`/announcements/${id}/status`, payload);
  return res.data;
}

export function mergeAnnouncementUpdate(prev, updated) {
  return {
    ...prev,
    ...updated,
    closesAt: updated.closesAt ?? null,
    closedAt: updated.closedAt ?? null,
    closedBy: updated.closedBy ?? null,
  };
}

export async function fetchAcknowledgements(id) {
  const res = await apiClient.get(`/announcements/${id}/acknowledgements`);
  return res.data;
}
