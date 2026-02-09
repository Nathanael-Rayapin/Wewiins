import { BookingStatus } from "../interfaces/booking-status";
import { BookingStatusPipe } from "./status.pipe";

describe('BookingStatusPipe', () => {
    const pipe = new BookingStatusPipe();

    it.concurrent('transforms "BookingStatus.FINISH" to "Terminé"', () => {
        const result = {
            status: 'Terminé',
            backgroundColor: 'var(--primary-text)'
        }
        expect(pipe.transform(BookingStatus.FINISH)).toEqual(result);
    });

    it.concurrent('transforms "BookingStatus.COMING_SOON" to "À venir"', () => {
        const result = {
            status: 'À venir',
            backgroundColor: 'var(--primary-color)'
        }
        expect(pipe.transform(BookingStatus.COMING_SOON)).toEqual(result);
    });

    it.concurrent('transforms "BookingStatus.CANCEL" to "Annulé"', () => {
        const result = {
            status: 'Annulé',
            backgroundColor: 'var(--secondary-color)'
        }
        expect(pipe.transform(BookingStatus.CANCEL)).toEqual(result);
    });

    it.concurrent('transforms "BookingStatus.PENDING" to "En attente"', () => {
        const result = {
            status: 'En attente',
            backgroundColor: 'var(--quaternary-color)'
        }
        expect(pipe.transform(BookingStatus.PENDING)).toEqual(result);
    });

    it.concurrent('transforms "BookingStatus.PAYMENT_FAILED" to "Échec du paiement"', () => {
        const result = {
            status: 'Échec du paiement',
            backgroundColor: 'var(--secondary-color)'
        }
        expect(pipe.transform(BookingStatus.PAYMENT_FAILED)).toEqual(result);
    });
});
