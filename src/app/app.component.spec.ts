import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

describe('AppComponent', () => {
    beforeEach(() => {
        void TestBed.configureTestingModule({
            imports: [AppModule],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        void expect(app).toBeTruthy();
    });
});

// Test
