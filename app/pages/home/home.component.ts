import {Component} from '@angular/core';
import {NavController, Toast, Loading, Modal, Storage, Alert, LocalStorage} from 'ionic-angular';
import {FilterComponent} from "../filter/filter.component";
import {User} from "../../shared/user/user";
import {UserService} from "../../shared/user/user.service";
import {GroupsComponent} from "../groups/groups.component";
import {AuthModel} from "../../shared/auth/auth.model";

/**
 * Home component
 */

@Component({
  templateUrl: 'build/pages/home/home.component.html',
  providers: [UserService]
})
export class HomeComponent {

  users: Array<User> = [];
  upi: String;
  localStorage: Storage;

  excludedFilters = {
    upi: true,
    email: false,
    displayName: false,
    firstName: false,
    lastName: false
  };

  constructor(private nav: NavController, private userService: UserService, private authModel: AuthModel) {
    this.localStorage = new Storage(LocalStorage);
  }

  // Just grab upi and search for now
  search() {
    let loading = Loading.create({
      content: 'Searching',
      spinner: 'dots'
    });
    this.nav.present(loading);

    if (this.upi) {
      this.userService.getUserByUpi(this.upi).subscribe(data => {
        if (data) {
          loading.dismiss().then(() => {
            this.users.push(data);
            this.upi = this.users.length > 0 ? "" : this.upi;
          });
        } else {
          loading.dismiss().then(() => {
            this.nav.present(Toast.create({
              message: `User ${this.upi} not found :(`,
              duration: 4000
            }));
          });
        }
      }, error => {
        loading.dismiss().then(() => {
          this.nav.present(Toast.create({
            message: JSON.parse(error._body).message,
            duration: 4000
          }));
        });
      });
    }
  }

  presentFilter() {
    let modal = Modal.create(FilterComponent, this.excludedFilters);
    this.nav.present(modal);

    modal.onDismiss(data => {
      if (data) {
        this.excludedFilters = data;
      }
    });
  }

  presentGroups(user: User) {
    let modal = Modal.create(GroupsComponent, user);
    this.nav.present(modal);
  }

  clearResults() {
    this.users = [];
  }

  popUser(user) {
    let index = this.users.indexOf(user, 0);

    if (index > -1) {
      this.users.splice(index, 1)
    }
  }

  logout() {
    this.localStorage.remove('identity_info');
    this.authModel.access_token = null;
    this.authModel.expires_in = null;

    let confirm = Alert.create({
      title: 'Successfully logged out',
      message: "You'll have to log in again to use this app",
      buttons: [{
        text: 'Login',
        handler: () => {
          window.location.href = "https://pam.dev.auckland.ac.nz/identity/oauth2/authorize?client_id=maxx-identity-app&response_type=token";
        }
      }]
    });

    this.nav.present(confirm);
  }
}
