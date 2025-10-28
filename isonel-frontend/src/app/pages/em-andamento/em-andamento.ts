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
      etapa: 'Preparação',
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
      etapa: 'Ligação',
      dataInicio: '27/10/2025 14:00',
      dataEtapa: '27/10/2025 14:00',
      cliente: 'Dani Narguiles',
      produto: 'Câmara Frigorífica',
      responsavel: 'Funcionário 2',
      observacao: ''
    }
  ];

  etapas = [
    'Venda',
    'Preparação',
    'Colagem',
    'Secagem',
    'Dobragem',
    'Entrega',
    'Montagem',
    'Ligação'
  ];

  constructor() {
    const etapaComProcesso = this.etapasResumo.find((etapa) => etapa.qtd > 0);
    if (etapaComProcesso) {
      this.etapaAtiva = etapaComProcesso.nome;
    }
  }

  get etapasResumo() {
    const nomes = new Set(this.etapas);

    this.processos.forEach((processo) => nomes.add(processo.etapa));

    return Array.from(nomes).map((nome) => ({
      nome,
      qtd: this.processos.filter((processo) => processo.etapa === nome).length,
    }));
  }

  get processosFiltrados() {
    if (!this.etapaAtiva) {
      return this.processos;
    }

    return this.processos.filter((processo) => processo.etapa === this.etapaAtiva);
  }

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

  // ➕ NOVAS VARIÁVEIS
modalCorteAberto = false;
processoCorte: any = null;
infoCorte: string = '';
materiais: any[] = [];

// ➕ NOVOS MÉTODOS
abrirModalCorte(p: any) {
  this.fecharModais();
  this.processoCorte = { ...p };
  // começa com uma linha vazia
  this.materiais = [{ material: '', altura: '', largura: '', espessura: '', quantidade: '' }];
  this.modalCorteAberto = true;
}

adicionarLinha() {
  this.materiais.push({ material: '', altura: '', largura: '', espessura: '', quantidade: '' });
}

removerLinha(index: number) {
  this.materiais.splice(index, 1);
}

concluirCorte() {
  // valida todas as linhas
  const invalidos = this.materiais.some(m => 
    !m.material || !m.altura || !m.largura || !m.espessura || !m.quantidade
  );

  if (invalidos) {
    alert('Preencha todos os campos antes de concluir.');
    return;
  }

  console.log(`Cortes do processo #${this.processoCorte.codigo}:`);
  console.table(this.materiais);

  // Aqui você chamaria a API real
  // this.http.post(`/api/etapas/${this.processoCorte.codigo}/cortes`, this.materiais)...

  alert(`Cortes registrados com sucesso para o processo #${this.processoCorte.codigo}!`);
  this.modalCorteAberto = false;
}

fecharModalCorte() {
  this.modalCorteAberto = false;
}

finalizarProcesso(p: any) {
  console.log(`🔹 Finalizando processo #${p.codigo}`);
  
  // Aqui você vai chamar a outra API:
  // this.http.post('/api/processos/finalizar', { id: p.codigo })...

  // Simulação temporária:
  p.status = 'Finalizado';
  p.cor = 'green';

  alert(`Processo #${p.codigo} finalizado com sucesso!`);
}

}
