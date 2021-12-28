import { TestBed } from '@angular/core/testing';
import { AccountsComponent } from './account.component';
import { AppModule } from '../../app.module';

describe('AccountComponent', () => {
    beforeEach(() => {
        void TestBed.configureTestingModule({
            imports: [AppModule],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AccountsComponent);
        const app = fixture.debugElement.componentInstance;
        void expect(app).toBeTruthy();
    });
});
