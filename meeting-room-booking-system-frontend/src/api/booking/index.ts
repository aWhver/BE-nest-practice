import { POST } from '../../common/http';
import { createBookingQuery } from './types';

export const createBooking = (data: createBookingQuery) =>
  POST<string>('/booking/create', data);
