import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule], 
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() readonly menuToggled = new EventEmitter<boolean>();
  menuAberto = false;
  processos: any;

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    this.menuToggled.emit(this.menuAberto);
  }

  closeMenu(): void {
    if (!this.menuAberto) {
      return;
    }

    this.menuAberto = false;
    this.menuToggled.emit(this.menuAberto);
  }

   etapas = ['Venda', 'Preparação', 'Colagem', 'Secagem', 'Dobragem', 'Entrega', 'Montagem', 'Ligação'];

  // 🔹 VARIÁVEIS
modalCriarAberto = false;
novoProcesso: any = {
  status: 'Em andamento',
  etapa: 'Venda',
  cliente: '',
  responsavel: '',
  produto: '',
  observacao: ''
};

// 🔹 MÉTODOS
abrirModalCriar() {
  this.fecharModais();
  this.novoProcesso = {
    status: 'Em andamento',
    etapa: 'Venda',
    cliente: '',
    produto: '',
    observacao: ''
  };
  this.modalCriarAberto = true;
}
 fecharModais() {
  this.modalCriarAberto = false;
}


fecharModalCriar() {
  this.modalCriarAberto = false;
}

criarProcesso() {
  const { status, etapa, cliente, produto } = this.novoProcesso;

  if (!cliente.trim() || !produto.trim()) {
    alert('Preencha o cliente e o produto.');
    return;
  }

  // Gerar código automático
  const codigo = (Math.floor(Math.random() * 100000)).toString().padStart(5, '0');

  const novo = {
    codigo,
    status,
    cor: status === 'Finalizado' ? 'green' : status === 'Pausado' ? 'gray' : 'orange',
    etapa,
    dataInicio: new Date().toLocaleString(),
    dataEtapa: new Date().toLocaleString(),
    cliente,
    produto,
    responsavel: 'Automático',
    observacao: this.novoProcesso.observacao
  };

  this.processos.push(novo);
  this.modalCriarAberto = false;

  alert(`Processo #${codigo} criado com sucesso!`);
}

}

