import { Routes } from '@angular/router';
import { EmAndamento } from './pages/em-andamento/em-andamento';
import { Finalizado } from './pages/finalizado/finalizado';
import { Pausado } from './pages/pausado/pausado';
import { DadosPage } from './pages/dados/dados';

export const routes: Routes = [
  { path: 'andamento', component: EmAndamento },
  { path: 'finalizado', component: Finalizado },
  { path: 'pausado', component: Pausado },
  { path: 'dados', component: DadosPage },
  { path: '', redirectTo: 'andamento', pathMatch: 'full' }
];
