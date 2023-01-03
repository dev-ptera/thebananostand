import { animate, animateChild, group, query, state, style, transition, trigger } from '@angular/animations';

const slideIn = [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
        }),
    ]),
    query(':enter', [style({ right: '-100%' })]),
    query(':leave', animateChild(), { optional: true }),
    group([
        query(':leave', [animate('300ms ease-out', style({ right: '100%' }))], { optional: true }),
        query(':enter', [animate('300ms ease-out', style({ right: '0%' }))]),
    ]),
    query(':enter', animateChild()),
];

const slideOut = [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
        }),
    ]),
    query(':enter', [style({ left: '-100%' })]),
    query(':leave', animateChild()),
    group([
        query(':leave', [animate('300ms ease-out', style({ left: '100%' }))]),
        query(':enter', [animate('300ms ease-out', style({ left: '0%' }))]),
    ]),
    query(':enter', animateChild()),
];

export const slideInAnimation = trigger('routeAnimations', [
    transition('Home => Account', slideIn),
    transition('Account => Home', slideOut),
    transition('* => Settings', slideIn),
    transition('Settings => *', slideOut),
    transition('* => AddressBook', slideIn),
    transition('AddressBook => *', slideOut),
]);

export const hoverDashboardActions = trigger('slide', [
    state('in', style({ transform: 'translateX(0)' })),
    transition('void => *', [style({ transform: 'translateX(100%)' }), animate(250)]),
    transition('* => void', [animate(250, style({ transform: 'translateX(200%)' }))]),
]);
