import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, RequestOptions, Headers } from '@angular/http';
import { User } from '../_models/User';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class UserService {

    baseUrl = environment.apiUrl;

    constructor(private authHttp: AuthHttp) { }

    getUsers(): Observable<User[]> {
        // use this when not using authHttp -> return this.authHttp.get(this.baseUrl + 'users', this.jwt())
        return this.authHttp.get(this.baseUrl + 'users')
            .map(response => <User[]>response.json())
            .catch(this.handleError);
    }

    getUser(id): Observable<User> {
        return this.authHttp
            .get(this.baseUrl + 'users/' + id)
            .map(response => <User>response.json())
            .catch(this.handleError);
    }

    updateUser(id: number, user: User) {
        return this.authHttp.put(this.baseUrl + 'users/' + id, user).catch(this.handleError);
    }

    setMainPhoto(userId: number, id: number) {
        return this.authHttp.post(this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain', {}).catch(this.handleError);
    }

    // this is no longer used but i will leave it for reference
    // we are now using AuthModule to send our json web token with every request.
    private jwt() {
        const token = localStorage.getItem('token');
        if (token) {
            const headers = new Headers({ 'Authorization': 'Bearer ' + token });
            headers.append('Content-type', 'application/json');

            return new RequestOptions({ headers: headers });
        }
    }

    private handleError(error: any) {
        const applicationError = error.headers.get('Application-Error');
        if (applicationError) {
            return Observable.throw(applicationError);
        }
        const serverError = error.json();
        let modelStateErrors = '';
        if (serverError) {
            for (const key in serverError) {
                if (serverError[key]) {
                    modelStateErrors += serverError[key] + '\n';
                }
            }
        }
        return Observable.throw(modelStateErrors || 'Server error');
    }
}
