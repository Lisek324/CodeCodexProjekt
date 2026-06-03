import { Routes } from '@angular/router';
import { Home } from '../components/home/home';
import { LoginPage } from '../components/login-page/login-page';
import { HtmlDetails } from '../components/html-details/html-details';
import { AngularDetail } from '../components/angular-detail/angular-detail';
import { CppDetails } from '../components/cpp-details/cpp-details';
import { RegisterPage } from '../components/register-page/register-page';
import { Dashboard } from '../components/dashboard/dashboard';
import { authGuard } from '../authGuard/auth-guard';
import { guestGuard } from '../guestGuard/guest-guard';
import { Course } from '../components/course/course';

export const routes: Routes = [
    {
        path: 'home',
        component: Home,
    },
    {
        path: 'login',
        component: LoginPage,
        canActivate: [guestGuard]
    },
    {
        path: 'htmlDetails',
        component: HtmlDetails
    },
    {
        path: 'angularDetails',
        component: AngularDetail
    },
    {
        path: 'cppDetails',
        component: CppDetails
    },
    {
        path: 'register',
        component: RegisterPage,
        canActivate: [guestGuard]
    }
    ,
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: 'course',
        component: Course
    },
    {
        path: '**', 
        redirectTo: '/home'
    },
];
