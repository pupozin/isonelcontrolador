import { Routes } from '@angular/router';
import { EmAndamento } from './pages/em-andamento/em-andamento';

export const routes: Routes = [
  { path: 'andamento', component: EmAndamento },
  { path: '', redirectTo: 'andamento', pathMatch: 'full' }
];
