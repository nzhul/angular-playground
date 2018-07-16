import { UsersComponent } from './users.component';
import { of } from 'rxjs/observable/of';
import { UserService } from '../../services/user.service';

describe('Users Component', () => {

    let component: UsersComponent;

    const fakeUser = {
        id: 1,
        name: 'fake'
    };

    // const fakeUserService = {
    //     getUsers: () => of([fakeUser]),
    //     httpClient: {}
    // } as any;

    // const fakeUserService = jasmine.createSpyObj('userService', ['getUsers']);
    const userService = new UserService(null);

    beforeEach(() => {
        component = new UsersComponent(userService);
    });

    it('should have a component', () => {
        expect(component).toBeTruthy();
    });

    it('should have a list of users', () => {
        const spy = spyOn(userService, 'getUsers').and.returnValue(of([fakeUser]));
        component.ngOnInit();
        component.users$.subscribe(users => {
            console.log(users);
            expect(users).toEqual([fakeUser]);
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
