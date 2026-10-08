import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardArea, SidebarLayoutComponent } from '../sidebar-layout/sidebar-layout.component';

@Component({
    selector: 'app-espace-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarLayoutComponent],
    template: `
    <app-sidebar-layout [area]="area()">
      <router-outlet></router-outlet>
    </app-sidebar-layout>
  `
})
export class EspaceLayoutComponent {
    constructor(private authService: AuthService) { }

    /* Le menu s'adapte au rôle de la personne connectée */
    readonly area = computed<DashboardArea>(() => {
        const role = this.authService.currentUserRole();
        if (role === 'PRODUCTEUR') return 'producer';
        if (role === 'ADMINISTRATEUR' || role === 'SUPER_ADMINISTRATEUR') return 'admin';
        return 'breeder';
    });
}
