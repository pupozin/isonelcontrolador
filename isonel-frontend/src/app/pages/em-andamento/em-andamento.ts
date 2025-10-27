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

  abrirDetalhes(p: any) {
    this.fecharModais();

    // 🔹 Cria cópia profunda (para não compartilhar referência com o outro modal)
    this.processoSelecionado = JSON.parse(JSON.stringify(p));

    // 🔹 Adiciona campo exclusivo para diferenciar modal geral
    this.processoSelecionado.tipoModal = 'geral';

    this.modalGeralAberto = true;
  }

  fecharModalGeral() {
    this.modalGeralAberto = false;
  }

  salvarAlteracoes() {
    console.log('Salvar alterações do processo (Geral):', this.processoSelecionado);
    this.modalGeralAberto = false;
  }

  avancarEtapa(p: any) {
    this.fecharModais();

    // 🔹 Cópia separada do mesmo processo para modal de etapa
    this.etapaSelecionada = JSON.parse(JSON.stringify(p));

    // 🔹 Campo auxiliar pra garantir isolamento de contexto
    this.etapaSelecionada.tipoModal = 'etapa';

    this.modalEtapaAberto = true;
  }

  fecharModalEtapa() {
    this.modalEtapaAberto = false;
  }

  salvarEtapa() {
    console.log('Salvar alterações da Etapa:', this.etapaSelecionada);
    this.modalEtapaAberto = false;
  }
}
