import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { RoleDirective } from '../../shared/directives/role.directive';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  // authService = inject(AuthService);
  // private router = inject(Router);

  // async logout() {
  //   await this.authService.signOut();
  //   this.router.navigate(['/login']);
  // }
}
