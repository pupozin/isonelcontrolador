import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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

type ProcessoDetalhado = ProcessoResumo & {
  dataEtapa?: string;
  observacao?: string;
};

@Component({
  selector: 'app-pausado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pausado.html',
  styleUrls: ['./pausado.scss']
})
export class Pausado implements OnInit, OnDestroy {
  abaAtiva = 'geral';
  processos: ProcessoResumo[] = [];
  carregando = false;
  modalGeralAberto = false;
  processoSelecionado: ProcessoDetalhado | null = null;

  private carregandoContador = 0;
  private subscriptions = new Subscription();
  private readonly mapaEtapas: Record<string, string> = {
    venda: 'Venda',
    preparacao: 'Preparacao',
    colagem: 'Colagem',
    secagem: 'Secagem',
    dobragem: 'Dobragem',
    entrega: 'Entrega',
    montagem: 'Montagem',
    ligacao: 'Ligacao'
  };

  constructor(private readonly processoService: ProcessoService) {}

  ngOnInit(): void {
    this.carregarProcessos();
    this.subscriptions.add(
      this.processoService.processosAtualizados$.subscribe(() => this.carregarProcessos())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  carregarProcessos(): void {
    this.iniciarCarregamento();
    this.processoService.listarProcessosPausados().subscribe({
      next: (dados) => {
        this.processos = (dados ?? []).map<ProcessoResumo>((p) => {
          const status = p.statusProcesso ?? 'Pausado';
          return {
            id: p.id,
            codigo: p.codigo,
            cliente: p.cliente,
            produto: p.produto,
            etapa: this.formatarEtapa(p.estadoAtual, 'Venda'),
            status,
            cor: this.corPorStatus(status),
            dataInicio: this.formatarData(p.dataInicio),
            responsavel: p.responsavel ?? ''
          };
        });
        this.finalizarCarregamento();
      },
      error: (erro) => {
        console.error('Erro ao carregar processos pausados:', erro);
        this.finalizarCarregamento();
      }
    });
  }

  selecionarAba(aba: string): void {
    if (this.abaAtiva !== aba) {
      this.abaAtiva = aba;
    }
  }

  abrirDetalhesGeral(processo: ProcessoResumo): void {
    this.modalGeralAberto = true;
    this.iniciarCarregamento();

    this.processoService.obterDetalhesProcesso(processo.id).subscribe({
      next: (dados) => {
        const status = dados.statusProcesso ?? processo.status ?? 'Pausado';
        this.processoSelecionado = {
          id: dados.id ?? processo.id,
          codigo: dados.codigo ?? processo.codigo,
          cliente: dados.cliente ?? processo.cliente,
          produto: dados.produto ?? processo.produto,
          etapa: this.formatarEtapa(dados.estadoAtual, processo.etapa),
          status,
          cor: this.corPorStatus(status),
          dataInicio: this.formatarData(dados.dataInicioProcesso, processo.dataInicio),
          responsavel: dados.responsavel ?? processo.responsavel,
          dataEtapa: this.formatarData(dados.dataInicioEtapa),
          observacao: dados.observacao ?? ''
        };
        this.finalizarCarregamento();
      },
      error: (erro) => {
        console.error('Erro ao carregar detalhes do processo pausado:', erro);
        this.finalizarCarregamento();
      }
    });
  }

  fecharModalGeral(): void {
    this.modalGeralAberto = false;
    this.processoSelecionado = null;
  }

  salvarAlteracoes(): void {
    if (!this.processoSelecionado?.id) {
      return;
    }

    const payload: { statusAtual: string; observacao: string; responsavel?: string } = {
      statusAtual: this.processoSelecionado.status,
      observacao: this.processoSelecionado.observacao ?? ''
    };

    const responsavel = this.processoSelecionado.responsavel?.trim();
    if (responsavel) {
      payload.responsavel = responsavel;
    }

    this.iniciarCarregamento();
    this.processoService.atualizarProcesso(this.processoSelecionado.id, payload).subscribe({
      next: () => {
        this.modalGeralAberto = false;
        this.processoSelecionado = null;
        this.finalizarCarregamento();
        this.carregarProcessos();
      },
      error: (erro) => {
        console.error('Erro ao salvar alteracoes do processo pausado:', erro);
        this.finalizarCarregamento();
        alert('Nao foi possivel salvar as alteracoes. Veja o console.');
      }
    });
  }

  private iniciarCarregamento(): void {
    this.carregandoContador += 1;
    if (this.carregandoContador === 1) {
      this.carregando = true;
    }
  }

  private finalizarCarregamento(): void {
    this.carregandoContador = Math.max(0, this.carregandoContador - 1);
    if (this.carregandoContador === 0) {
      this.carregando = false;
    }
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
    return this.mapaEtapas[chave] ?? valor;
  }

  private formatarData(valor?: string, fallback = ''): string {
    if (!valor) {
      return fallback;
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
      return fallback;
    }

    return data.toLocaleString();
  }

  private removerAcentos(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
