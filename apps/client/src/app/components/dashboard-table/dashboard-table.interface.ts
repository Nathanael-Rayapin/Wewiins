import { BookingStatus } from "../../interfaces/booking-status";

export interface IDashboardColumn {
    field: string;
    header: string;
}

export interface IDashboardBooking {
  id: string;
  reference: string;
  name: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  participants: number;
  title: string;
  totalPrice: number;
  status: BookingStatus;
}