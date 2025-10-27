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
  modalAvancarAberto = false;

  processoSelecionado: any = null;
  etapaSelecionada: any = null;
  processoAvancar: any = null;
  novoResponsavel: string = '';

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
    this.modalAvancarAberto = false;
  }

  // Detalhes GERAL
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

  // Detalhes ETAPA
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

  // ➕ Avançar Etapa (novo modal)
  abrirAvancarEtapa(p: any) {
    this.fecharModais();
    this.processoAvancar = { ...p };
    this.novoResponsavel = '';
    this.modalAvancarAberto = true;
  }

  fecharModalAvancar() {
    this.modalAvancarAberto = false;
  }

  concluirAvanco() {
    if (!this.novoResponsavel.trim()) {
      alert('Informe o responsável pela próxima etapa.');
      return;
    }

    console.log(`Avançando processo #${this.processoAvancar.codigo}`);
    console.log(`Novo responsável: ${this.novoResponsavel}`);

    // 🔹 Simulação da atualização (mock)
    this.processoAvancar.responsavel = this.novoResponsavel;
    this.processoAvancar.etapa = 'Preparação'; // apenas exemplo de próxima etapa

    // Fecha o modal
    this.modalAvancarAberto = false;
  }
}
