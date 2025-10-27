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
    { codigo: '00291', status: 'Em andamento', cor: 'orange', etapa: 'Venda', responsavel: 'Funcionário 1', produto: 'Câmara Frigorífica', cliente: 'Mercado Barbosa' },
    { codigo: '00292', status: 'Finalizado', cor: 'green', etapa: 'Dobragens', responsavel: 'Funcionário 2', produto: 'Câmara Frigorífica', cliente: 'Dani Narguiles' },
    { codigo: '00293', status: 'Pendente', cor: 'gray', etapa: 'Venda', responsavel: 'Funcionário 3', produto: 'Câmara Frigorífica', cliente: 'Paraty' },
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
