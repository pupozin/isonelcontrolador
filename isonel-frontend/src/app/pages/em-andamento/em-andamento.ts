import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-em-andamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './em-andamento.html',
  styleUrls: ['./em-andamento.scss']
})
export class EmAndamento {
  abaAtiva = 'geral';
  etapaAtiva = 'Venda';

  modalGeralAberto = false;
  modalEtapaAberto = false;

  processoSelecionado: any = null;
  etapaSelecionada: any = null;

  processos = [
    {
      codigo: '00291',
      status: 'Em andamento',
      cor: 'orange',
      etapa: 'Venda',
      dataInicio: '27/10/2025 12:00',
      dataEtapa: '27/10/2025 12:00',
      cliente: 'Mercado Barbosa',
      produto: 'Câmara Frigorífica',
      responsavel: 'Funcionário 1',
      observacao: 'Cliente solicitou prioridade na entrega.'
    },
    {
      codigo: '00292',
      status: 'Finalizado',
      cor: 'green',
      etapa: 'Venda',
      dataInicio: '27/10/2025 14:00',
      dataEtapa: '27/10/2025 14:00',
      cliente: 'Dani Narguiles',
      produto: 'Câmara Frigorífica',
      responsavel: 'Funcionário 2',
      observacao: ''
    }
  ];

  etapas = [
    { nome: 'Venda', qtd: 3 },
    { nome: 'Preparação', qtd: 1 },
    { nome: 'Colagem', qtd: 0 },
    { nome: 'Secagem', qtd: 0 },
    { nome: 'Montagem', qtd: 0 },
    { nome: 'Entrega', qtd: 0 },
  ];

  private fecharModais() {
    this.modalGeralAberto = false;
    this.modalEtapaAberto = false;
  }

  // 🔹 Detalhes GERAL (Aba 1)
  abrirDetalhesGeral(p: any) {
    this.fecharModais();
    this.processoSelecionado = { ...p };
    this.modalGeralAberto = true;
  }

  fecharModalGeral() {
    this.modalGeralAberto = false;
  }

  salvarAlteracoes() {
    console.log('Salvar alterações do processo (Geral):', this.processoSelecionado);
    this.modalGeralAberto = false;
  }

  // 🔹 Detalhes ETAPA (Aba 2)
  abrirDetalhesEtapa(p: any) {
    this.fecharModais();
    this.etapaSelecionada = { ...p };
    this.modalEtapaAberto = true;
  }

  fecharModalEtapa() {
    this.modalEtapaAberto = false;
  }

  salvarEtapa() {
    console.log('Salvar alterações da Etapa:', this.etapaSelecionada);
    this.modalEtapaAberto = false;
  }

  // 🔹 Avançar etapa (não abre modal)
  avancarEtapa(p: any) {
    console.log('Avançar etapa do processo:', p);
    // lógica futura aqui
  }
}
