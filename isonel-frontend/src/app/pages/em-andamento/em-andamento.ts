import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProcessoService } from '../../services/processo';

interface ProcessoResumo {
  id: number;
  codigo: string;
  cliente: string;
  produto: string;
  etapa: string;
  status: string;
  cor: string;
  dataInicio: string;
  responsavel: string;
}

interface ProcessoEtapa {
  id: number;
  codigo: string;
  cliente: string;
  responsavel: string;
  etapa: string;
  status: string;
  cor: string;
}

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

  processos: ProcessoResumo[] = [];
  processosFiltrados: ProcessoEtapa[] = [];
  processosPorEtapa: Record<string, ProcessoEtapa[]> = {};

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

  private readonly etapasConfig = [
    { nome: 'Venda', parametro: 'VENDA' },
    { nome: 'Preparacao', parametro: 'PREPARACAO' },
    { nome: 'Colagem', parametro: 'COLAGEM' },
    { nome: 'Secagem', parametro: 'SECAGEM' },
    { nome: 'Dobragem', parametro: 'DOBRAGEM' },
    { nome: 'Entrega', parametro: 'ENTREGA' },
    { nome: 'Montagem', parametro: 'MONTAGEM' },
    { nome: 'Ligacao', parametro: 'LIGACAO' }
  ];

  readonly etapas = this.etapasConfig.map((config) => config.nome);

  private readonly mapaEtapas: Record<string, string> = this.etapas.reduce((mapa, etapa) => {
    mapa[this.removerAcentos(etapa).toLowerCase()] = etapa;
    return mapa;
  }, {} as Record<string, string>);

  constructor(private processoService: ProcessoService) {}

  ngOnInit(): void {
    this.carregarProcessos();
  }

  private removerAcentos(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private corPorStatus(status?: string): string {
    const chave = (status ?? '').toLowerCase();
    if (chave === 'finalizado') {
      return 'green';
    }
    if (chave === 'pendente') {
      return 'gray';
    }
    return 'orange';
  }

  private formatarEtapa(valor?: string, padrao = ''): string {
    if (!valor) {
      return padrao;
    }
    const chave = this.removerAcentos(valor).toLowerCase();
    const fallback = padrao || valor;
    return this.mapaEtapas[chave] ?? fallback;
  }

  carregarProcessos(): void {
    this.carregando = true;
    this.processoService.listarProcessosAndamento().subscribe({
      next: (dados) => {
        this.processos = dados.map<ProcessoResumo>((p) => {
          const etapa = this.formatarEtapa(p.estadoAtual, 'Venda');
          const status = p.statusProcesso ?? 'Em andamento';
          return {
            id: p.id,
            codigo: p.codigo,
            cliente: p.cliente,
            produto: p.produto,
            etapa,
            status,
            cor: this.corPorStatus(status),
            dataInicio: new Date(p.dataInicio).toLocaleString(),
            responsavel: p.responsavel
          };
        });
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar processos:', err);
        this.carregando = false;
      }
    });
  }

  private carregarTodasAsEtapas(): void {
    if (this.etapasCarregadas) {
      this.atualizarProcessosFiltrados();
      return;
    }

    this.carregando = true;
    const requisicoes = this.etapasConfig.map((config) =>
      this.processoService.listarProcessosEtapaEmAndamento(config.parametro)
    );

    forkJoin(requisicoes).subscribe({
      next: (listas) => {
        this.processosPorEtapa = {};

        listas.forEach((dados, index) => {
          const etapaConfig = this.etapasConfig[index];
          const etapa = etapaConfig.nome;
          this.processosPorEtapa[etapa] = dados.map<ProcessoEtapa>((p) => {
            const status = p.statusEtapa ?? 'Em andamento';
            return {
              id: p.processoId,
              codigo: p.codigo,
              cliente: p.cliente,
              responsavel: p.responsavel,
              etapa,
              status,
              cor: this.corPorStatus(status)
            };
          });
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

  private atualizarProcessosFiltrados(): void {
    this.processosFiltrados = this.processosPorEtapa[this.etapaAtiva] ?? [];
  }

  selecionarAba(aba: string): void {
    if (this.abaAtiva === aba) {
      return;
    }

    this.abaAtiva = aba;
    if (aba === 'processos') {
      this.carregarTodasAsEtapas();
    }
  }

  selecionarEtapa(nome: string): void {
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

  fecharModais(): void {
    this.modalGeralAberto = false;
    this.modalEtapaAberto = false;
    this.modalAvancarAberto = false;
    this.modalCorteAberto = false;
  }

  abrirDetalhesGeral(processo: ProcessoResumo): void {
    this.fecharModais();
    this.modalGeralAberto = true;
    this.carregando = true;

    this.processoService.obterDetalhesProcesso(processo.id).subscribe({
      next: (dados) => {
        const status = dados.statusProcesso ?? 'Em andamento';
        this.processoSelecionado = {
          codigo: dados.codigo,
          cliente: dados.cliente,
          produto: dados.produto,
          etapa: this.formatarEtapa(dados.estadoAtual, processo.etapa),
          status,
          cor: this.corPorStatus(status),
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

  abrirDetalhesEtapa(processo: ProcessoEtapa): void {
    this.fecharModais();
    this.modalEtapaAberto = true;
    this.etapaSelecionada = { ...processo };
    this.carregando = true;

    this.processoService.obterDetalhesEtapaAtual(processo.id).subscribe({
      next: (dados) => {
        const status = dados.statusEtapa ?? 'Em andamento';
        this.etapaSelecionada = {
          id: dados.processoId,
          codigo: dados.codigo,
          cliente: dados.cliente,
          produto: dados.produto,
          etapa: this.formatarEtapa(dados.tipoEtapa, processo.etapa),
          status,
          cor: this.corPorStatus(status),
          dataInicio: new Date(dados.dataInicioProcesso).toLocaleString(),
          dataEtapa: new Date(dados.dataInicioEtapa).toLocaleString(),
          responsavel: dados.responsavel,
          observacao: dados.observacao ?? ''
        };
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes da etapa:', err);
        this.carregando = false;
        this.modalEtapaAberto = false;
        alert('Erro ao carregar detalhes da etapa. Veja o console.');
      }
    });
  }

  abrirAvancarEtapa(processo: ProcessoEtapa): void {
    this.fecharModais();
    this.processoAvancar = { ...processo };
    this.novoResponsavel = '';
    this.modalAvancarAberto = true;
  }

  abrirModalCorte(processo: ProcessoEtapa): void {
    this.fecharModais();
    this.processoCorte = { ...processo };
    this.materiais = [{ material: '', altura: '', largura: '', espessura: '', quantidade: '' }];
    this.modalCorteAberto = true;
  }

  fecharModalGeral(): void {
    this.modalGeralAberto = false;
  }

  fecharModalEtapa(): void {
    this.modalEtapaAberto = false;
  }

  fecharModalAvancar(): void {
    this.modalAvancarAberto = false;
  }

  fecharModalCorte(): void {
    this.modalCorteAberto = false;
  }

  salvarAlteracoes(): void {
    console.log('Salvando alteracoes gerais:', this.processoSelecionado);
    this.modalGeralAberto = false;
  }

  salvarEtapa(): void {
    console.log('Salvando alteracoes da etapa:', this.etapaSelecionada);
    this.modalEtapaAberto = false;
  }

  concluirAvanco(): void {
    if (!this.novoResponsavel.trim()) {
      alert('Informe o responsavel pela proxima etapa.');
      return;
    }

    console.log(
      `Avancando ${this.processoAvancar.codigo} com o novo responsavel: ${this.novoResponsavel}`
    );
    this.modalAvancarAberto = false;
  }

  adicionarLinha(): void {
    this.materiais.push({ material: '', altura: '', largura: '', espessura: '', quantidade: '' });
  }

  removerLinha(index: number): void {
    this.materiais.splice(index, 1);
  }

  concluirCorte(): void {
    const existeIncompleto = this.materiais.some(
      (item) => !item.material || !item.altura || !item.largura || !item.espessura || !item.quantidade
    );

    if (existeIncompleto) {
      alert('Preencha todos os campos antes de concluir.');
      return;
    }

    console.table(this.materiais);
    this.modalCorteAberto = false;
  }

  finalizarProcesso(processo: ProcessoResumo | ProcessoEtapa): void {
    console.log(`Finalizando ${processo.codigo}`);
    processo.status = 'Finalizado';
    processo.cor = 'green';
  }
}
