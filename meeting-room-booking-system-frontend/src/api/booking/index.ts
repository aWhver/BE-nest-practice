import { GET, POST } from '../../common/http';
import {
  BookingList,
  BookingListQuery,
  UrgeQuery,
  createBookingQuery,
} from './types';

export const createBooking = (data: createBookingQuery) =>
  POST<string>('/booking/create', data);

export const getBookingList = (params?: BookingListQuery) =>
  GET<BookingList>('/booking/list', params);

export const approveBooking = (id: number) =>
  GET<string>(`/booking/approve/${id}`);

export const rejectBooking = (id: number) =>
  GET<string>(`/booking/reject/${id}`);

export const urgeBooking = (data: UrgeQuery) =>
  POST<string>(`/booking/urge`, data);

export const cancelBooking = (id: number) =>
  GET<string>(`/booking/cancel/${id}`);