import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUser } from 'src/app/interfaces/avenger.models.interface';
import { UserStoreService } from 'src/app/stores/user-store.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  you: IUser | any;
  showMobileNav: boolean = false;

  links: any;

  constructor(
    private userStore: UserStoreService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userStore.getChangesObs().subscribe({
      next: (you) => {
        this.you = you;
        console.log({ you });
        
        this.links = !!you
          ? [
              { text: `Notices`, href: ['/', 'feed', 'notices'] },
              { text: `Interviews`, href: ['/', 'feed', 'interviews'] },
              // { text: `Questions`, href: ['/', 'feed', 'questions'] },
              // { text: `Answers`, href: ['/', 'feed', 'answers'] },

              { text: ``, href: [] },
              
              { text: `Home`, href: ['/', 'users', you.id] },
              { text: `Settings`, href: ['/', 'users', you.id, 'settings'] },
              { text: `Sign Out`, href: ['/', 'signout'] },
            ]
          : [
              { text: `Sign In`, href: ['/', 'signin'] },
              { text: `Sign Up`, href: ['/', 'signup'] },
            ];
      }
    });
  }

}
