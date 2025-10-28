import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessoService } from '../../services/processo';

@Component({
  selector: 'app-em-andamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './em-andamento.html',
  styleUrls: ['./em-andamento.scss']
})
export class EmAndamento implements OnInit {
  abaAtiva = 'geral';
  etapaAtiva = 'Venda';

  processos: any[] = [];
  carregando = false;

  modalGeralAberto = false;
  modalEtapaAberto = false;
  modalAvancarAberto = false;
  modalCorteAberto = false;

  processoSelecionado: any = null;
  etapaSelecionada: any = null;
  processoAvancar: any = null;
  processoCorte: any = null;
  novoResponsavel: string = '';
  materiais: any[] = [];

  etapas = [
    'Venda', 'Preparação', 'Colagem', 'Secagem', 'Dobragem', 'Entrega', 'Montagem', 'Ligação'
  ];

  constructor(private processoService: ProcessoService) {}

  ngOnInit() {
    this.carregarProcessos();
  }

  carregarProcessos() {
    this.carregando = true;
    this.processoService.listarProcessosAndamento().subscribe({
      next: (dados) => {
        this.processos = dados.map((p) => ({
          id: p.id,
          codigo: p.codigo,
          cliente: p.cliente,
          produto: p.produto,
          etapa: p.estadoAtual,
          status: p.statusEtapa ?? 'Em andamento',
          cor: p.statusEtapa === 'Finalizado' ? 'green' : 'orange',
          dataInicio: new Date(p.dataInicio).toLocaleString(),
          responsavel: p.responsavel
        }));
        this.carregando = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar processos:', err);
        this.carregando = false;
      }
    });
  }

  get etapasResumo() {
    return this.etapas.map((nome) => ({
      nome,
      qtd: this.processos.filter((p) => p.etapa === nome).length
    }));
  }

  get processosFiltrados() {
    return this.processos.filter((p) => p.etapa === this.etapaAtiva);
  }

  // ========== MODAIS ==========
  fecharModais() {
    this.modalGeralAberto = false;
    this.modalEtapaAberto = false;
    this.modalAvancarAberto = false;
    this.modalCorteAberto = false;
  }

abrirDetalhesGeral(p: any) {
  this.fecharModais();
  this.modalGeralAberto = true;
  this.carregando = true;

  this.processoService.obterDetalhesProcesso(p.id).subscribe({
    next: (dados) => {
      this.processoSelecionado = {
        codigo: dados.codigo,
        cliente: dados.cliente,
        produto: dados.produto,
        etapa: dados.estadoAtual,
        status: dados.statusEtapa ?? 'Em andamento',
        cor: dados.statusEtapa === 'Finalizado' ? 'green' : 'orange',
        dataInicio: new Date(dados.dataInicioProcesso).toLocaleString(),
        dataEtapa: new Date(dados.dataInicioEtapa).toLocaleString(),
        responsavel: dados.responsavel,
        observacao: dados.observacao ?? ''
      };
      this.carregando = false;
    },
    error: (err) => {
      console.error('❌ Erro ao carregar detalhes do processo:', err);
      this.carregando = false;
      this.modalGeralAberto = false;
      alert('Erro ao carregar detalhes. Veja o console.');
    }
  });
}


  abrirDetalhesEtapa(p: any) {
    this.fecharModais();
    this.etapaSelecionada = { ...p };
    this.modalEtapaAberto = true;
  }

  abrirAvancarEtapa(p: any) {
    this.fecharModais();
    this.processoAvancar = { ...p };
    this.novoResponsavel = '';
    this.modalAvancarAberto = true;
  }

  abrirModalCorte(p: any) {
    this.fecharModais();
    this.processoCorte = { ...p };
    this.materiais = [{ material: '', altura: '', largura: '', espessura: '', quantidade: '' }];
    this.modalCorteAberto = true;
  }

  fecharModalGeral() { this.modalGeralAberto = false; }
  fecharModalEtapa() { this.modalEtapaAberto = false; }
  fecharModalAvancar() { this.modalAvancarAberto = false; }
  fecharModalCorte() { this.modalCorteAberto = false; }

  // ========= AÇÕES ==========
  salvarAlteracoes() {
    console.log('🔹 Salvando alterações gerais:', this.processoSelecionado);
    this.modalGeralAberto = false;
  }

  salvarEtapa() {
    console.log('🔹 Salvando alterações da etapa:', this.etapaSelecionada);
    this.modalEtapaAberto = false;
  }

  concluirAvanco() {
    if (!this.novoResponsavel.trim()) {
      alert('Informe o responsável pela próxima etapa.');
      return;
    }

    console.log(`Avançando ${this.processoAvancar.codigo} → novo responsável: ${this.novoResponsavel}`);
    this.modalAvancarAberto = false;
  }

  adicionarLinha() {
    this.materiais.push({ material: '', altura: '', largura: '', espessura: '', quantidade: '' });
  }

  removerLinha(index: number) {
    this.materiais.splice(index, 1);
  }

  concluirCorte() {
    const invalidos = this.materiais.some(m => !m.material || !m.altura || !m.largura || !m.espessura || !m.quantidade);
    if (invalidos) {
      alert('Preencha todos os campos antes de concluir.');
      return;
    }

    console.table(this.materiais);
    this.modalCorteAberto = false;
  }

  finalizarProcesso(p: any) {
    console.log(`🔹 Finalizando${p.codigo}`);
    p.status = 'Finalizado';
    p.cor = 'green';
  }
}
