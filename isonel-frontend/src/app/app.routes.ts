import { Routes } from '@angular/router';
import { EmAndamento } from './pages/em-andamento/em-andamento';
import { Finalizado } from './pages/finalizado/finalizado';
import { Pausado } from './pages/pausado/pausado';

export const routes: Routes = [
  { path: 'andamento', component: EmAndamento },
  { path: 'finalizado', component: Finalizado },
  { path: 'pausado', component: Pausado },
  { path: '', redirectTo: 'andamento', pathMatch: 'full' }
];
