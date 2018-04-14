import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { User } from '../_models/User';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { AuthHttp } from 'angular2-jwt';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';

@Injectable()
export class UserService {

    baseUrl = environment.apiUrl;

    constructor(private authHttp: AuthHttp) { }

    getUsers(page?: number, itemsPerPage?: number, userParams?: any, likesParam?: string) {
        // use this when not using authHttp -> return this.authHttp.get(this.baseUrl + 'users', this.jwt())

        const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
        let queryString = '?';

        if (page != null && itemsPerPage != null) {
            queryString += 'pageNumber=' + page + '&pageSize=' + itemsPerPage + '&';
        }

        if (userParams != null) {
            queryString +=
                'minAge=' + userParams.minAge +
                '&maxAge=' + userParams.maxAge +
                '&gender=' + userParams.gender +
                '&orderBy=' + userParams.orderBy;
        }

        if (likesParam === 'Likers') {
            queryString += 'Likers=true&';
        }

        if (likesParam === 'Likees') {
            queryString += 'Likees=true&';
        }

        return this.authHttp.get(this.baseUrl + 'users' + queryString)
            .map((response: Response) => {
                paginatedResult.result = response.json();

                if (response.headers.get('Pagination') != null) {
                    paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
                }

                return paginatedResult;
            })
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

    deletePhoto(userId: number, id: number) {
        return this.authHttp.delete(this.baseUrl + 'users/' + userId + '/photos/' + id).catch(this.handleError);
    }

    sendLike(id: number, recipientId: number) {
        return this.authHttp.post(this.baseUrl + 'users/' + id + '/like/' + recipientId, {}).catch(this.handleError);
    }

    getMessages(id: number, page?: number, itemsPerPage?: number, messageContainer?: string) {
        const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();
        let queryString = '?MessageContainer=' + messageContainer;

        if (page != null && itemsPerPage != null) {
            queryString += '&pageNumber=' + page + '&pageSize=' + itemsPerPage;
        }

        return this.authHttp.get(this.baseUrl + 'users/' + id + '/messages' + queryString).map((response: Response) => {
            paginatedResult.result = response.json();

            if (response.headers.get('Pagination') != null) {
                paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
            }

            return paginatedResult;
        }).catch(this.handleError);
    }

    getMessageThread(id: number, recipientId: number) {
        return this.authHttp.get(this.baseUrl + 'users/' + id + '/messages/thread/' + recipientId).map((response: Response) => {
            return response.json();
        }).catch(this.handleError);
    }

    sendMessage(id: number, message: Message) {
        return this.authHttp.post(this.baseUrl + 'users/' + id + '/messages', message).map((response: Response) => {
            return response.json();
        }).catch(this.handleError);
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
        if (error.status === 400) {
            return Observable.throw(error._body);
        }
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
