import { format, formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
};

export const formatDateShort = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { 
    addSuffix: true,
    locale: vi 
  });
};

export const getStatusColor = (statusCode) => {
  const status = Object.values(DOCUMENT_STATUS).find(s => s.code === statusCode);
  return status?.color || 'gray';
};

export const getPriorityColor = (priority) => {
  const p = Object.values(PRIORITY).find(pr => pr.value === priority);
  return p?.color || 'gray';
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};