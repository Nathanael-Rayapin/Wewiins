import { Pipe, PipeTransform } from '@angular/core';
import { BookingStatus } from '../interfaces/booking-status';

export interface IStatus {
    status: string;
    backgroundColor: string;
}

@Pipe({
    name: 'status',
    standalone: true
})
export class BookingStatusPipe implements PipeTransform {
    transform(status: BookingStatus): IStatus {
        switch (status) {
            case BookingStatus.FINISH:
                return {
                    status: 'Terminé',
                    backgroundColor: 'var(--primary-text)'
                };
            case BookingStatus.COMING_SOON:
                return {
                    status: 'À venir',
                    backgroundColor: 'var(--primary-color)'
                };
            case BookingStatus.CANCEL:
                return {
                    status: 'Annulé',
                    backgroundColor: 'var(--secondary-color)'
                };
            case BookingStatus.PENDING:
                return {
                    status: 'En attente',
                    backgroundColor: 'var(--quaternary-color)'
                };
            case BookingStatus.PAYMENT_FAILED:
                return {
                    status: 'Échec du paiement',
                    backgroundColor: 'var(--secondary-color)'
                };
            default:
                return {
                    status: 'Inconnu',
                    backgroundColor: '#000000'
                };
        }
    }
}
