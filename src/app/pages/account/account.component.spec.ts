import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../app.module';
import {AccountComponent} from "@app/pages/account/account.component";

describe('AccountComponent', () => {
    beforeEach(() => {
        void TestBed.configureTestingModule({
            imports: [AppModule],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AccountComponent);
        const app = fixture.debugElement.componentInstance;
        void expect(app).toBeTruthy();
    });
});
