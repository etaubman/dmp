/**
 * Admin section shell: sub-nav for Domain Management, User Management, Settings, Bulk Upload/Download,
 * and a router-outlet for admin child routes (e.g. admin/domains, admin/user-management).
 *
 * Rendered inside the main LayoutComponent when the user navigates under /admin.
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {}
