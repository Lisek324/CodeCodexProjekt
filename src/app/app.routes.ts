import { Routes } from '@angular/router';
import { Home } from '../components/home/home';
import { LoginPage } from '../components/login-page/login-page';
import { HtmlDetails } from '../components/html-details/html-details';
import { AngularDetail } from '../components/angular-detail/angular-detail';
import { CppDetails } from '../components/cpp-details/cpp-details';

export const routes: Routes = [
    {
        path: 'home',
        component: Home
    },
    {
        path: 'login',
        component: LoginPage
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
        path: 'angularDetails',
        component: AngularDetail
    },
    {
        path: 'cppDetails',
        component: CppDetails
    }
];
