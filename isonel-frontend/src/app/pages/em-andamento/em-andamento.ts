import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-em-andamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './em-andamento.html',
  styleUrls: ['./em-andamento.scss']
})
export class EmAndamento {
  abaAtiva = 'geral';
  etapaAtiva = 'Venda';
  modalAberto = false;
  processoSelecionado: any = null;

  processos = [
    { codigo: '00291', status: 'Em andamento', cor: 'orange', etapa: 'Venda', dataInicio: '27/10/2025 12:00', cliente: 'Mercado Barbosa', produto: 'Câmara Frigorífica', responsavel: 'Funcionário 1' },
    { codigo: '00292', status: 'Finalizado', cor: 'green', etapa: 'Venda', dataInicio: '27/10/2025 14:00', cliente: 'Dani Narguiles', produto: 'Câmara Frigorífica', responsavel: 'Funcionário 2' },
    { codigo: '00293', status: 'Pendente', cor: 'gray', etapa: 'Venda', dataInicio: '27/10/2025 09:00', cliente: 'Paraty', produto: 'Câmara Frigorífica', responsavel: 'Funcionário 3' },
    { codigo: '00290', status: 'Finalizado', cor: 'green', etapa: 'Preparação', dataInicio: '25/10/2025 13:00', cliente: 'Dani Narguiles', produto: 'Câmara Frigorífica', responsavel: 'Funcionário 4' }
  ];

  etapas = [
    { nome: 'Venda', qtd: 3 },
    { nome: 'Preparação', qtd: 1 },
    { nome: 'Colagem', qtd: 0 },
    { nome: 'Secagem', qtd: 0 },
    { nome: 'Montagem', qtd: 0 },
    { nome: 'Entrega', qtd: 0 },
  ];

  abrirDetalhes(p: any) {
    this.processoSelecionado = p;
    this.modalAberto = true;
  }

  avancarEtapa(p: any) {
    this.processoSelecionado = p;
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }
}
