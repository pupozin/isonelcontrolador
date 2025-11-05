import { Routes } from '@angular/router';
import { EmAndamento } from './pages/em-andamento/em-andamento';
import { Pausado } from './pages/pausado/pausado';

export const routes: Routes = [
  { path: 'andamento', component: EmAndamento },
  { path: 'pausado', component: Pausado },
  { path: '', redirectTo: 'andamento', pathMatch: 'full' }
];
