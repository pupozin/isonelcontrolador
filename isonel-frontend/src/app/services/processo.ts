import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface DetalhesProcessoFinalizadoDto {
  processoId: number;
  codigo: string;
  cliente: string;
  produto: string;
  statusProcesso: string;
  observacao: string | null;
  dataInicioProcesso: string;
  dataFimProcesso: string;
  duracaoTotalMinutos: number;
  duracaoFormatada: string;
  responsavel?: string | null;
}

export interface EtapaFinalizadaDto {
  etapaId: number;
  tipoEtapa: string;
  responsavel: string;
  status: string;
  dataInicioEtapa: string;
  dataFimEtapa: string;
  duracaoMinutos: number;
  duracaoFormatada: string;
  observacao: string | null;
}

export interface InsightsResumoDto {
  processosIniciados: number;
  processosFinalizados: number;
  duracaoMediaProcessoMin: number | null;
  duracaoMedianaProcessoMin: number | null;
  duracaoMediaEtapaMin: number | null;
}

export interface InsightsEtapaTipoDto {
  tipoEtapa: string;
  qtdEtapas: number;
  duracaoMediaMin: number | null;
}

export interface InsightsProcessoDestaqueDto {
  processoId: number;
  codigo: string;
  cliente: string;
  produto: string;
  dataInicio: string;
  dataFim: string | null;
  duracaoMinutos: number;
  duracaoFormatada: string;
}

export interface InsightsProcessosPorDiaDto {
  dia: string;
  processosFinalizados: number;
}

export interface InsightsResponsavelDto {
  responsavel: string;
  qtdEtapas: number;
  duracaoMediaMin: number | null;
}

export interface InsightsProcessosResponse {
  resumo: InsightsResumoDto;
  mediasPorEtapa: InsightsEtapaTipoDto[];
  processosMaisLentos: InsightsProcessoDestaqueDto[];
  throughputDiario: InsightsProcessosPorDiaDto[];
  responsaveis: InsightsResponsavelDto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProcessoService {
  private apiUrl = 'https://localhost:7137/api/Processo'; // Ajuste se a API usar outra porta
  private apiUrlInsights = 'https://localhost:7137/api/insights'; // Ajuste se a API usar outra porta
  private etapaUrl = 'https://localhost:7137/api/Etapa';

  private readonly processosAtualizadosSubject = new Subject<void>();
  readonly processosAtualizados$ = this.processosAtualizadosSubject.asObservable();

  constructor(private http: HttpClient) {}

  listarProcessosAndamento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/andamento`);
  }

  listarProcessosPausados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pausado`);
  }

  listarProcessosFinalizados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/finalizado`);
  }

  obterDetalhesProcesso(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalhes`);
  }

  listarProcessosEtapaEmAndamento(tipoEtapa: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/etapa/andamento/${encodeURIComponent(tipoEtapa)}`);
  }

  obterDetalhesEtapa(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalhes-etapa`);
  }

  atualizarProcesso(
    id: number,
    payload: { statusAtual: string; observacao: string; responsavel?: string }
  ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  avancarEtapa(
    id: number,
    payload: { responsavel: string; proximaEtapa: string; observacao?: string }
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/avancar-etapa`, payload);
  }

  atualizarEtapa(
    id: number,
    payload: { status?: string; statusEtapa?: string; observacao: string; responsavel?: string }
  ): Observable<any> {
    return this.http.put<any>(`${this.etapaUrl}/${id}`, payload);
  }

  criarProcesso(payload: {
    cliente: string;
    produto: string;
    responsavel: string;
    tipoEtapa?: string;
    observacao?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload);
  }

  getDetalhesProcessoFinalizado(id: number): Observable<DetalhesProcessoFinalizadoDto> {
    return this.http.get<DetalhesProcessoFinalizadoDto>(`${this.apiUrl}/${id}/detalhes-finalizado`);
  }

  getEtapasProcessoFinalizado(id: number): Observable<EtapaFinalizadaDto[]> {
    return this.http.get<EtapaFinalizadaDto[]>(`${this.apiUrl}/${id}/etapas-finalizado`);
  }

  obterInsightsProcessos(ano: number, mes: number): Observable<InsightsProcessosResponse> {
    return this.http.get<InsightsProcessosResponse>(`${this.apiUrlInsights}/processos?ano=${ano}&mes=${mes}`);
  }

  notificarAtualizacaoProcessos(): void {
    this.processosAtualizadosSubject.next();
  }

  pesquisarProcessos(termo: string) {
    return this.http.get<any[]>(`${this.apiUrl}/pesquisar?termo=${encodeURIComponent(termo)}`);
  }
}
