import { login_setup } from './mod_login/login';
import { register_setup } from './mod_login/register';

export class Login {
    constructor (step: string) {
        switch (step) {
        case 'login':
            login_setup ();
            break;
        case 'register':
            register_setup ();
            break;
        }
    }
}
