import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessoService } from '../../services/processo';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() readonly menuToggled = new EventEmitter<boolean>();
  menuAberto = false;
  modalCriarAberto = false;

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

  novoProcesso: any = {
    etapa: 'Venda',
    cliente: '',
    responsavel: '',
    produto: '',
    observacao: ''
  };

  toast = {
    visivel: false,
    mensagem: '',
    tipo: '' // 'sucesso' ou 'erro'
  };

  constructor(private processoService: ProcessoService) {}

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    this.menuToggled.emit(this.menuAberto);
  }

  closeMenu(): void {
    if (!this.menuAberto) return;
    this.menuAberto = false;
    this.menuToggled.emit(this.menuAberto);
  }

  abrirModalCriar() {
    this.novoProcesso = {
      etapa: 'Venda',
      cliente: '',
      responsavel: '',
      produto: '',
      observacao: ''
    };
    this.modalCriarAberto = true;
  }

  fecharModalCriar() {
    this.modalCriarAberto = false;
   }

  criarProcesso() {
    const { cliente, produto, responsavel, etapa, observacao } = this.novoProcesso;

    if (!cliente.trim() || !produto.trim() || !responsavel.trim()) {
      this.exibirToast('Preencha cliente, produto e responsável.', 'erro');
      return;
    }

    const dados = {
      cliente,
      produto,
      responsavel,
      tipoEtapa: etapa,
      observacao
    };

    this.processoService.criarProcesso(dados).subscribe({
      next: (res) => {
        console.log('✅ Processo criado:', res);
        this.exibirToast(`${res.codigo} criado com sucesso!`, 'sucesso');
        this.fecharModalCriar();
      },
      error: (err) => {
        console.error('❌ Erro ao criar processo:', err);
        this.exibirToast('Erro ao criar processo. Verifique o console.', 'erro');
      }
    });
  }

  exibirToast(mensagem: string, tipo: 'sucesso' | 'erro') {
    this.toast.mensagem = mensagem;
    this.toast.tipo = tipo;
    this.toast.visivel = true;

    setTimeout(() => {
      this.toast.visivel = false;
    }, 3000); 
  }
}



