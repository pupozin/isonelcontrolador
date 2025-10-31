import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessoService } from '../../services/processo';
import { forkJoin } from 'rxjs';

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

  processos: any[] = []; // usados na aba GERAL
  processosFiltrados: any[] = []; // usados na aba PROCESSOS
  processosPorEtapa: Record<string, any[]> = {};
  carregando = false;
  etapasCarregadas = false;

  modalGeralAberto = false;
  modalEtapaAberto = false;
  modalAvancarAberto = false;
  modalCorteAberto = false;

  processoSelecionado: any = null;
  etapaSelecionada: any = null;
  processoAvancar: any = null;
  processoCorte: any = null;
  novoResponsavel = '';
  materiais: any[] = [];

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

  constructor(private processoService: ProcessoService) {}

  ngOnInit() {
    this.carregarProcessos();
  }

  // Carrega resumo geral
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
          status: p.statusProcesso ?? 'Em andamento',
          cor:
            p.statusProcesso === 'Finalizado'
              ? 'green'
              : p.statusProcesso === 'Pendente'
              ? 'gray'
              : 'orange',
          dataInicio: new Date(p.dataInicio).toLocaleString(),
          responsavel: p.responsavel
        }));
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar processos:', err);
        this.carregando = false;
      }
    });
  }

  // Carrega todas as etapas ao abrir a aba de processos
  private carregarTodasAsEtapas() {
    if (this.etapasCarregadas) {
      this.atualizarProcessosFiltrados();
      return;
    }

    this.carregando = true;
    const requisicoes = this.etapas.map((etapa) =>
      this.processoService.listarProcessosEtapaEmAndamento(etapa)
    );

    forkJoin(requisicoes).subscribe({
      next: (listas) => {
        this.processosPorEtapa = {};
        listas.forEach((dados, index) => {
          const etapa = this.etapas[index];
          this.processosPorEtapa[etapa] = dados.map((p) => ({
            id: p.processoId,
            codigo: p.codigo,
            cliente: p.cliente,
            responsavel: p.responsavel,
            etapa,
            status: p.statusEtapa ?? 'Em andamento',
            cor:
              p.statusEtapa === 'Finalizado'
                ? 'green'
                : p.statusEtapa === 'Pendente'
                ? 'gray'
                : 'orange'
          }));
        });
        this.etapasCarregadas = true;
        this.atualizarProcessosFiltrados();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar etapas em andamento:', err);
        this.carregando = false;
      }
    });
  }

  private atualizarProcessosFiltrados() {
    this.processosFiltrados = this.processosPorEtapa[this.etapaAtiva] ?? [];
  }

  selecionarAba(aba: string) {
    if (this.abaAtiva === aba) {
      return;
    }

    this.abaAtiva = aba;

    if (aba === 'processos') {
      this.carregarTodasAsEtapas();
    }
  }

  selecionarEtapa(nome: string) {
    this.etapaAtiva = nome;

    if (!this.etapasCarregadas) {
      this.carregarTodasAsEtapas();
      return;
    }

    this.atualizarProcessosFiltrados();
  }

  get etapasResumo() {
    return this.etapas.map((nome) => ({
      nome,
      qtd: this.processosPorEtapa[nome]?.length ?? 0
    }));
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
          cor:
            dados.statusEtapa === 'Finalizado'
              ? 'green'
              : dados.statusEtapa === 'Pendente'
              ? 'gray'
              : 'orange',
          dataInicio: new Date(dados.dataInicioProcesso).toLocaleString(),
          dataEtapa: new Date(dados.dataInicioEtapa).toLocaleString(),
          responsavel: dados.responsavel,
          observacao: dados.observacao ?? ''
        };
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do processo:', err);
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

  fecharModalGeral() {
    this.modalGeralAberto = false;
  }
  fecharModalEtapa() {
    this.modalEtapaAberto = false;
  }
  fecharModalAvancar() {
    this.modalAvancarAberto = false;
  }
  fecharModalCorte() {
    this.modalCorteAberto = false;
  }

  // ========= AÇÕES ==========
  salvarAlteracoes() {
    console.log('Salvando alterações gerais:', this.processoSelecionado);
    this.modalGeralAberto = false;
  }

  salvarEtapa() {
    console.log('Salvando alterações da etapa:', this.etapaSelecionada);
    this.modalEtapaAberto = false;
  }

  concluirAvanco() {
    if (!this.novoResponsavel.trim()) {
      alert('Informe o responsável pela próxima etapa.');
      return;
    }
    console.log(
      `Avançando ${this.processoAvancar.codigo} com o novo responsável: ${this.novoResponsavel}`
    );
    this.modalAvancarAberto = false;
  }

  adicionarLinha() {
    this.materiais.push({ material: '', altura: '', largura: '', espessura: '', quantidade: '' });
  }

  removerLinha(index: number) {
    this.materiais.splice(index, 1);
  }

  concluirCorte() {
    const invalidos = this.materiais.some(
      (m) => !m.material || !m.altura || !m.largura || !m.espessura || !m.quantidade
    );
    if (invalidos) {
      alert('Preencha todos os campos antes de concluir.');
      return;
    }

    console.table(this.materiais);
    this.modalCorteAberto = false;
  }

  finalizarProcesso(p: any) {
    console.log(`Finalizando ${p.codigo}`);
    p.status = 'Finalizado';
    p.cor = 'green';
  }
}
