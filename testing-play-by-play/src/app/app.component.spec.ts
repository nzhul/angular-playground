import { AppComponent } from './app.component';

describe('App Component', () => {

    let component: AppComponent;

    beforeEach(() => {
        component = new AppComponent();
    });

    it('should 1 + 1', () => {
        expect(1 + 1).toEqual(2);
    });
    it('should have a component', () => {
        expect(component).toBeTruthy();
    });

    it('should have a title of `app`', () => {
        component = new AppComponent();
        expect(component.title).toEqual('app');
    });
});

