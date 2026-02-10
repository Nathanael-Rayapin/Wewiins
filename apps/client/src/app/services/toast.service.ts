import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'info' | 'warn' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private messageService = inject(MessageService);

    private readonly TOAST_KEY = 'bottom-right';
    private readonly DEFAULT_LIFE = 3000;

    show(severity: ToastSeverity, summary: string, detail?: string, life?: number) {
        this.messageService.add({
            severity,
            summary,
            detail,
            key: this.TOAST_KEY,
            life: life ?? this.DEFAULT_LIFE
        });
    }

    info(summary: string, detail?: string, life?: number) {
        this.show('info', summary, detail, life);
    }

    warn(summary: string, detail?: string, life?: number) {
        this.show('warn', summary, detail, life);
    }

    success(summary: string, detail?: string, life?: number) {
        this.show('success', summary, detail, life);
    }

    error(summary: string, detail?: string, life?: number) {
        this.show('error', summary, detail, life);
    }

    clear() {
        this.messageService.clear(this.TOAST_KEY);
    }
}