import { format, isValid } from 'date-fns';

export const formatForInput = (val) => {
  if (!val) return '';
  let date = typeof val === 'number' ? new Date(val * 1000) : new Date(val);
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
};

export const formatForDisplay = (val) => {
  if (!val) return 'N/A';
  let date = typeof val === 'number' ? new Date(val * 1000) : new Date(val);
  return isValid(date) ? format(date, 'PPP') : 'Invalid Date';
};