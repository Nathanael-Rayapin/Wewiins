import { TestBed } from "@angular/core/testing";
import { MessageService } from "primeng/api";
import { ToastService } from "./toast.service";

describe('Toast Service', () => {

    TestBed.configureTestingModule({
        providers: [ToastService, MessageService],
    });

    const toastService = TestBed.inject(ToastService);

    it.concurrent('should called show with info severity', async ({expect}) => {
        const spy = vi.spyOn(toastService, 'show');

        toastService.info('Une simple information');

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('info', 'Une simple information', undefined, undefined);
    })

    it.concurrent('should called show with warn severity', async ({expect}) => {
        const spy = vi.spyOn(toastService, 'show');

        toastService.warn('Un simple avertissement');

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('warn', 'Un simple avertissement', undefined, undefined);
    })

    it.concurrent('should called show with success severity', async () => {
        const spy = vi.spyOn(toastService, 'show');

        toastService.success('Un simple succès');

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('success', 'Un simple succès', undefined, undefined);
    })

    it.concurrent('should called show with error severity', async () => {
        const spy = vi.spyOn(toastService, 'show');

        toastService.error('Une simple erreur');

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('error', 'Une simple erreur', undefined, undefined);
    })
});
