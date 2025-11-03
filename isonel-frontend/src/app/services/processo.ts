import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessoService {
  private apiUrl = 'https://localhost:7137/api/Processo'; // Ajuste se a API usar outra porta
  private etapaUrl = 'https://localhost:7137/api/Etapa';

  constructor(private http: HttpClient) {}

  listarProcessosAndamento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/andamento`);
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
}
