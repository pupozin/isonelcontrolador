import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  InsightsProcessosResponse,
  ProcessoService
} from '../../services/processo';

@Component({
  selector: 'app-dados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dados.html',
  styleUrls: ['./dados.scss']
})
export class DadosPage implements OnInit {
  mesSelecionado = this.formatarMesInput(new Date());
  carregando = false;
  erro: string | null = null;
  insights: InsightsProcessosResponse | null = null;

  constructor(private readonly processoService: ProcessoService) {}

  ngOnInit(): void {
    this.carregarInsights();
  }

  alterarMes(): void {
    this.carregarInsights();
  }

  private carregarInsights(): void {
    const { ano, mes } = this.obterAnoMesReferencia();
    if (!ano || !mes) {
      this.erro = 'Selecione um mês válido.';
      return;
    }

    this.carregando = true;
    this.erro = null;
    this.insights = null;

    this.processoService.obterInsightsProcessos(ano, mes).subscribe({
      next: (dados) => {
        this.insights = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar insights:', erro);
        this.erro = 'Não foi possível carregar os insights. Tente novamente.';
        this.carregando = false;
      }
    });
  }

  formatarDuracao(minutos?: number | null): string {
    if (minutos === null || minutos === undefined || Number.isNaN(minutos)) {
      return '--';
    }
    if (minutos <= 0) {
      return '0 min';
    }
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    if (horas === 0) {
      return `${mins} min`;
    }
    return `${horas}h ${mins}m`;
  }

  formatarData(valor: string): string {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
      return valor;
    }
    return data.toLocaleDateString();
  }

  private formatarMesInput(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  }

  private obterAnoMesReferencia(): { ano: number; mes: number } {
    const partes = this.mesSelecionado.split('-');
    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    return { ano, mes };
  }
}
