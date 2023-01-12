import { TestBed } from '@angular/core/testing';
import { AppModule } from '../../app.module';
import { DashboardComponent } from '@app/pages/dashboard/dashboard.component';

describe('DashboardComponent', () => {
    beforeEach(() => {
        void TestBed.configureTestingModule({
            imports: [AppModule],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(DashboardComponent);
        const app = fixture.debugElement.componentInstance;
        void expect(app).toBeTruthy();
    });
});
