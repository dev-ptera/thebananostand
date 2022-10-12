import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiveMenuModule } from './user-menu.module';
import { ResponsiveMenuComponent } from './responsive-menu.component';
import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { count } from '../../utils/test-utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/** Test component that contains an MatButton. */
@Component({
    selector: 'test-md',
    template: `
        <blui-user-menu avatarValue="HA" [(open)]="open">
            <div blui-menu-header>
                <div id="custom-header-test"></div>
            </div>
        </blui-user-menu>
    `,
})
class UserMenuCustomHeaderTest {
    open = true;
}

/** Test component that contains an MatButton. */
@Component({
    selector: 'test-md',
    template: `
        <blui-user-menu avatarValue="HA" [(open)]="open">
            <mat-nav-list blui-menu-body>
                <mat-list-item id="list-item-test">List Item 1</mat-list-item>
            </mat-nav-list>
        </blui-user-menu>
    `,
})
class UserMenuNavItemsTest {
    open = true;
}

describe('UserMenuComponent', () => {
    let component: ResponsiveMenuComponent;
    let fixture: ComponentFixture<ResponsiveMenuComponent>;

    beforeEach(() => {
        void TestBed.configureTestingModule({
            declarations: [UserMenuNavItemsTest, UserMenuCustomHeaderTest],
            imports: [ResponsiveMenuModule, MatListModule, BrowserAnimationsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ResponsiveMenuComponent);
        component = fixture.componentInstance;
        spyOn(component, 'checkScreenSize').and.stub();
    });

    it('should initialize', () => {
        fixture.detectChanges();
        void expect(component).toBeTruthy();
    });

    it('should render text in the avatar', () => {
        component.avatarValue = 'HA';
        fixture.detectChanges();
        const avatar = fixture.nativeElement.querySelector('.blui-user-menu-avatar');
        void expect(avatar.innerText).toBe('HA');
    });

    it('should render the menu open is true', () => {
        fixture.detectChanges();
        let menu = document.getElementsByClassName('.blui-user-menu-overlay');
        void expect(menu).toBeTruthy();
        component.open = true;
        component.isMenuOpen = true;
        component.isActivelyUsingBottomSheet = false;
        fixture.detectChanges();
        menu = document.getElementsByClassName('.blui-user-menu-overlay');
        void expect(menu).toBeTruthy();
    });

    it('should render the title', () => {
        component.menuTitle = 'Sample Title';
        component.open = true;
        component.isMenuOpen = true;
        component.isActivelyUsingBottomSheet = false;
        fixture.detectChanges();
        const title = document.getElementsByClassName('blui-user-menu-header-title')[0] as HTMLElement;
        void expect(title.innerText).toBe('Sample Title');
    });

    it('should render the subtitle', () => {
        component.menuTitle = 'Sample Title';
        component.menuSubtitle = 'Sample Subtitle';
        component.open = true;
        component.isMenuOpen = true;
        component.isActivelyUsingBottomSheet = false;
        fixture.detectChanges();
        const title = document.getElementsByClassName('blui-user-menu-header-subtitle')[0] as HTMLElement;
        void expect(title.innerText).toBe('Sample Subtitle');
    });

    it('should render the custom header', () => {
        const headerFixture = TestBed.createComponent(UserMenuCustomHeaderTest);
        headerFixture.detectChanges();
        const header = document.getElementById('custom-header-test');
        void expect(header).toBeTruthy();
    });

    it('should render the nav items', () => {
        const listFixture = TestBed.createComponent(UserMenuNavItemsTest);
        listFixture.detectChanges();
        const listItem = document.getElementById('list-item-test');
        void expect(listItem).toBeTruthy();
    });

    it('should enforce class naming conventions', () => {
        component.avatarValue = 'EM';
        component.open = true;
        component.isMenuOpen = true;
        component.isActivelyUsingBottomSheet = false;
        component.menuTitle = 'Title';
        fixture.detectChanges();
        const fixtureClassList = ['.blui-user-menu-avatar', '.blui-user-menu-text-avatar'];
        const menuOverlayClassList = [
            'blui-user-menu-overlay-backdrop',
            'blui-user-menu-overlay',
            'blui-user-menu-header',
            'blui-user-menu-header-avatar',
        ];
        const bottomSheetClassList = ['blui-user-menu-bottomsheet', 'blui-user-menu-bottomsheet-backdrop'];
        for (const className of fixtureClassList) {
            count(fixture, className);
        }
        for (const className of menuOverlayClassList) {
            void expect(document.getElementsByClassName(className).length).toBe(1);
        }
        component.isActivelyUsingBottomSheet = true;
        component.isMenuOpen = false;
        component._openBottomSheet();
        for (const className of bottomSheetClassList) {
            void expect(document.getElementsByClassName(className).length).toBe(1);
        }
    });
});
