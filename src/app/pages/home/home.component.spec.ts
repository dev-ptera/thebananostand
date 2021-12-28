import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AppModule } from '../../app.module';

describe('HomeComponent', () => {
    beforeEach(() => {
        void TestBed.configureTestingModule({
            imports: [AppModule],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(HomeComponent);
        const app = fixture.debugElement.componentInstance;
        void expect(app).toBeTruthy();
    });
});
