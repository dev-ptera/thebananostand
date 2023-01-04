import { AfterViewInit, Component, Input, ViewEncapsulation } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
    selector: 'app-qr',
    template: ` <canvas id="qr-code" style="display: block;"></canvas> `,
    encapsulation: ViewEncapsulation.None,
})
export class QrDialogComponent implements AfterViewInit {
    @Input() address;

    ngAfterViewInit(): void {
        const canvas = document.getElementById('qr-code');
        QRCode.toCanvas(canvas, this.address, (error) => {
            if (error) console.error(error);
        });
    }
}
