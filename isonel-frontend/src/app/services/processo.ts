import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessoService {
  private apiUrl = 'https://localhost:7137/api/Processo'; // 🔹 Ajuste se sua API usar outra porta

  constructor(private http: HttpClient) {}

  criarProcesso(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dados);
  }

  listarProcessosAndamento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/andamento`);
  }

  obterDetalhesProcesso(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}/detalhes`);
  }

  listarProcessosEtapaEmAndamento(tipoEtapa: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/etapa/andamento/${encodeURIComponent(tipoEtapa)}`);
}

}
