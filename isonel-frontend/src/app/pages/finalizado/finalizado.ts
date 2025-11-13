import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  DetalhesProcessoFinalizadoDto,
  EtapaFinalizadaDto,
  ProcessoService
} from '../../services/processo';

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

@Component({
  selector: 'app-finalizado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finalizado.html',
  styleUrls: ['./finalizado.scss']
})
export class Finalizado implements OnInit, OnDestroy {
  abaAtiva = 'geral';
  processos: ProcessoResumo[] = [];
  carregando = false;
  modalDetalhesAberto = false;
  modalHistoricoAberto = false;
  processoResumoSelecionado: ProcessoResumo | null = null;
  detalhesProcessoFinalizado: DetalhesProcessoFinalizadoDto | null = null;
  historicoEtapas: EtapaFinalizadaDto[] = [];

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
    this.processoService.listarProcessosFinalizados().subscribe({
      next: (dados) => {
        this.processos = (dados ?? []).map<ProcessoResumo>((p) => {
          const status = p.statusProcesso ?? 'Finalizado';
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
        console.error('Erro ao carregar processos finalizados:', erro);
        this.finalizarCarregamento();
      }
    });
  }

  selecionarAba(aba: string): void {
    if (this.abaAtiva !== aba) {
      this.abaAtiva = aba;
    }
  }

  abrirDetalhesFinalizado(processo: ProcessoResumo): void {
    this.modalDetalhesAberto = true;
    this.processoResumoSelecionado = processo;
    this.detalhesProcessoFinalizado = null;
    this.iniciarCarregamento();

    this.processoService.getDetalhesProcessoFinalizado(processo.id).subscribe({
      next: (dados) => {
        this.detalhesProcessoFinalizado = dados;
        this.finalizarCarregamento();
      },
      error: (erro) => {
        console.error('Erro ao carregar detalhes do processo finalizado:', erro);
        this.finalizarCarregamento();
        alert('Nao foi possivel carregar os detalhes do processo. Tente novamente.');
        this.fecharModalDetalhes();
      }
    });
  }

  abrirHistoricoEtapas(): void {
    const processoId =
      this.detalhesProcessoFinalizado?.processoId ?? this.processoResumoSelecionado?.id;

    if (!processoId) {
      return;
    }

    this.modalHistoricoAberto = true;
    this.historicoEtapas = [];
    this.iniciarCarregamento();

    this.processoService.getEtapasProcessoFinalizado(processoId).subscribe({
      next: (dados) => {
        this.historicoEtapas = [...(dados ?? [])].sort((a, b) =>
          this.compararDatas(a.dataInicioEtapa, b.dataInicioEtapa)
        );
        this.finalizarCarregamento();
      },
      error: (erro) => {
        console.error('Erro ao carregar historico de etapas do processo:', erro);
        this.finalizarCarregamento();
        alert('Nao foi possivel carregar o historico de etapas. Tente novamente.');
        this.fecharModalHistorico();
      }
    });
  }

  fecharModalDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.processoResumoSelecionado = null;
    this.detalhesProcessoFinalizado = null;
    this.fecharModalHistorico();
  }

  fecharModalHistorico(): void {
    this.modalHistoricoAberto = false;
    this.historicoEtapas = [];
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

  private compararDatas(a?: string, b?: string): number {
    const dataA = a ? new Date(a).getTime() : 0;
    const dataB = b ? new Date(b).getTime() : 0;
    return dataA - dataB;
  }

  formatarData(valor?: string, fallback = ''): string {
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
