import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/User';
import { AdminService } from '../../_services/admin.service';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

    users: User[];

    constructor(private adminService: AdminService) { }

    ngOnInit() {
        this.getUsersWithRoles();
    }

    getUsersWithRoles() {
        this.adminService.getUsersWithRoles().subscribe((users: User[]) => {
            this.users = users;
        }, error => {
            console.log(error);
        });
    }

}
