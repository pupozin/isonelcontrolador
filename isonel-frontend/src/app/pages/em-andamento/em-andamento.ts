import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
  etapaId?: number;
  codigo: string;
  cliente: string;
  responsavel: string;
  etapa: string;
  status: string;
  cor: string;
}

interface MaterialCorte {
  id?: number;
  material: string;
  altura: string;
  largura: string;
  espessura: string;
  quantidade: string;
  readonly?: boolean;
}

@Component({
  selector: 'app-em-andamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './em-andamento.html',
  styleUrls: ['./em-andamento.scss']
})
export class EmAndamento implements OnInit, OnDestroy {
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
  materiais: MaterialCorte[] = [];
  private etapaDetalhesRaw: any = null;
  private subscriptions = new Subscription();
  private carregandoContador = 0;

  private readonly etapasConfig = [
    { nome: 'Venda', parametro: 'VENDA' },
    { nome: 'Preparação', parametro: 'PREPARAÇÃO' },
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

  constructor(private processoService: ProcessoService) {
    this.materiais = [this.criarMaterialEmBranco()];
  }

  ngOnInit(): void {
    this.carregarProcessos();
    this.subscriptions.add(
      this.processoService.processosAtualizados$.subscribe(() => {
        this.recarregarDadosPosAcao();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private criarMaterialEmBranco(): MaterialCorte {
    return { material: '', altura: '', largura: '', espessura: '', quantidade: '', readonly: false };
  }

  private formatarNumero(valor?: number): string {
    if (valor === null || valor === undefined) {
      return '';
    }
    return Number.isFinite(Number(valor)) ? String(valor) : '';
  }

  private normalizarMaterialServidor(item: any): MaterialCorte {
    const altura = this.formatarNumero(
      item?.altura ?? item?.Altura ?? item?.comprimento ?? item?.Comprimento
    );
    return {
      material: item?.tipoMaterial ?? item?.TipoMaterial ?? '',
      altura,
      largura: this.formatarNumero(item?.largura ?? item?.Largura),
      espessura: this.formatarNumero(item?.espessura ?? item?.Espessura),
      quantidade: this.formatarNumero(item?.quantidade ?? item?.Quantidade),
      readonly: true
    };
  }

  podeRemoverMaterial(item: MaterialCorte): boolean {
    const possuiDados =
      !!item.material?.trim() ||
      !!item.altura?.trim() ||
      !!item.largura?.trim() ||
      !!item.espessura?.trim() ||
      !!item.quantidade?.trim();

    return !item.readonly && !possuiDados;
  }

  private extrairEtapaId(fonte: any): number | null {
    if (!fonte) {
      return null;
    }
    const chaves = [
      'etapaId',
      'EtapaId',
      'etapaID',
      'EtapaID',
      'idEtapa',
      'IdEtapa',
      'IDEtapa',
      'etapa_id',
      'etapaAtualId',
      'EtapaAtualId',
      'etapaAtualID',
      'EtapaAtualID',
      'idEtapaAtual',
      'IdEtapaAtual'
    ];
    for (const chave of chaves) {
      const valor = fonte[chave];
      if (typeof valor === 'number' && !Number.isNaN(valor) && valor > 0) {
        return valor;
      }
      if (typeof valor === 'string') {
        const convertido = Number(valor);
        if (!Number.isNaN(convertido) && convertido > 0) {
          return convertido;
        }
      }
    }

    const valorId = fonte.id ?? fonte.Id;
    if (
      typeof valorId === 'number' &&
      !Number.isNaN(valorId) &&
      valorId > 0 &&
      valorId !== fonte.processoId &&
      valorId !== fonte.ProcessoId
    ) {
      return valorId;
    }

    return null;
  }

  private obterProximaEtapaConfig(nomeAtual: string): { nome: string; parametro: string } | null {
    const chave = this.removerAcentos(nomeAtual).toLowerCase();
    const indice = this.etapasConfig.findIndex(
      (config) => this.removerAcentos(config.nome).toLowerCase() === chave
    );
    if (indice >= 0 && indice < this.etapasConfig.length - 1) {
      return this.etapasConfig[indice + 1];
    }
    return null;
  }

  private resolverEtapaId(processoId: number, etapaNome: string) {
    const chave = this.removerAcentos(etapaNome).toLowerCase();
    const etapaConfig = this.etapasConfig.find(
      (config) => this.removerAcentos(config.nome).toLowerCase() === chave
    );
    const parametro = etapaConfig?.parametro ?? this.removerAcentos(etapaNome).toUpperCase();

    return this.processoService.listarProcessosEtapaEmAndamento(parametro).pipe(
      map((lista) => {
        const item = (lista ?? []).find((entrada) => {
          const candidatos = [
            entrada?.processoId,
            entrada?.ProcessoId,
            entrada?.idProcesso,
            entrada?.IdProcesso,
            entrada?.processoID
          ];

          return candidatos
            .map((valor) => (typeof valor === 'number' ? valor : Number(valor)))
            .some((valor) => !Number.isNaN(valor) && valor === processoId);
        });

        if (!item) {
          return null;
        }

        const encontrado = this.extrairEtapaId(item);
        return encontrado ?? null;
      }),
      catchError((erro) => {
        console.error('Erro ao tentar resolver o identificador da etapa:', erro);
        return of(null);
      })
    );
  }

  private buscarEtapaAtual(processoId: number) {
    return this.processoService.obterDetalhesEtapa(processoId).pipe(
      switchMap((dados) => {
        const etapaIdDetalhe = this.extrairEtapaId(dados);
        if (etapaIdDetalhe) {
          return of({ etapaId: etapaIdDetalhe, dados });
        }

        const tipoEtapa = dados?.tipoEtapa ?? dados?.TipoEtapa ?? '';
        if (!tipoEtapa) {
          console.warn(
            'Detalhes da etapa nao informaram o tipo da etapa. Retornando sem identificador.',
            dados
          );
          return of({ etapaId: null, dados });
        }

        return this.resolverEtapaId(processoId, tipoEtapa).pipe(
          map((etapaId) => {
            if (!etapaId) {
              console.warn(
                'Nao foi possivel inferir o identificador da etapa a partir do mapeamento adicional.',
                dados
              );
            }
            return { etapaId: etapaId ?? null, dados };
          })
        );
      }),
      catchError((erro) => {
        console.error('Erro ao recuperar detalhes da etapa:', erro);
        return of({ etapaId: null, dados: null });
      })
    );
  }

  exibeBotaoCorte(etapa?: string): boolean {
    if (!etapa) {
      return false;
    }
    return this.removerAcentos(etapa).toLowerCase() === 'preparacao';
  }

  carregarProcessos(): void {
    this.iniciarCarregamento();
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
        this.finalizarCarregamento();
      },
      error: (err) => {
        console.error('Erro ao carregar processos:', err);
        this.finalizarCarregamento();
      }
    });
  }

  private carregarTodasAsEtapas(): void {
    if (this.etapasCarregadas) {
      this.atualizarProcessosFiltrados();
      return;
    }

    this.iniciarCarregamento();
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
            const etapaId = this.extrairEtapaId(p);
            return {
              id: p.processoId,
              etapaId: etapaId ?? undefined,
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
        this.finalizarCarregamento();
      },
      error: (err) => {
        console.error('Erro ao carregar etapas em andamento:', err);
        this.finalizarCarregamento();
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

  private recarregarDadosPosAcao(): void {
    this.etapasCarregadas = false;
    this.carregarProcessos();
    if (this.abaAtiva === 'processos') {
      this.carregarTodasAsEtapas();
    }
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
    this.iniciarCarregamento();

    this.processoService.obterDetalhesProcesso(processo.id).subscribe({
      next: (dados) => {
        const status = dados.statusProcesso ?? 'Em andamento';
        this.processoSelecionado = {
          id: dados.id ?? processo.id,
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
        this.finalizarCarregamento();
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do processo:', err);
        this.finalizarCarregamento();
        this.modalGeralAberto = false;
        alert('Erro ao carregar detalhes. Veja o console.');
      }
    });
  }

  abrirDetalhesEtapa(processo: ProcessoEtapa): void {
    this.fecharModais();
    this.modalEtapaAberto = true;
    const etapaIdAtual = this.extrairEtapaId(processo);
    this.etapaSelecionada = { ...processo, etapaId: etapaIdAtual ?? processo.etapaId };
    this.iniciarCarregamento();
    this.etapaDetalhesRaw = null;

    this.processoService.obterDetalhesEtapa(processo.id).subscribe({
      next: (dados) => {
        const status = dados.statusEtapa ?? 'Em andamento';
        this.etapaDetalhesRaw = dados;
        const etapaIdDetalhe = this.extrairEtapaId(dados) ?? etapaIdAtual ?? null;

        this.etapaSelecionada = {
          id: dados.processoId ?? processo.id,
          etapaId: etapaIdDetalhe ?? undefined,
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

        if (!this.etapaSelecionada.etapaId) {
          console.warn('Detalhes da etapa nao trouxeram identificador. Tentando recuperar via fallback.');
          this.resolverEtapaId(this.etapaSelecionada.id, this.etapaSelecionada.etapa).subscribe({
            next: (etapaId) => {
              if (etapaId) {
                this.etapaSelecionada = { ...this.etapaSelecionada, etapaId };
              }
            },
            error: (erro) => {
              console.warn('Falha ao resolver identificador da etapa:', erro);
            }
          });
        }

        this.finalizarCarregamento();
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes da etapa:', err);
        this.finalizarCarregamento();
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
    const etapaId = this.extrairEtapaId(processo) ?? processo.etapaId ?? undefined;
    this.processoCorte = { ...processo, etapaId };
    this.materiais = [this.criarMaterialEmBranco()];
    this.modalCorteAberto = true;

    this.iniciarCarregamento();
    this.processoService.obterDetalhesPreparacao(processo.id).subscribe({
      next: (lista) => {
        const materiaisExistentes = (lista ?? []).map((item) => this.normalizarMaterialServidor(item));
        this.materiais =
          materiaisExistentes.length > 0
            ? [...materiaisExistentes, this.criarMaterialEmBranco()]
            : [this.criarMaterialEmBranco()];
        this.finalizarCarregamento();
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes de corte:', err);
        this.finalizarCarregamento();
      }
    });
  }

  fecharModalGeral(): void {
    this.modalGeralAberto = false;
  }

  fecharModalEtapa(): void {
    this.modalEtapaAberto = false;
    this.etapaDetalhesRaw = null;
  }

  fecharModalAvancar(): void {
    this.modalAvancarAberto = false;
  }

  fecharModalCorte(): void {
    this.modalCorteAberto = false;
    this.processoCorte = null;
    this.materiais = [this.criarMaterialEmBranco()];
  }

  salvarAlteracoes(): void {
    if (!this.processoSelecionado?.id) {
      return;
    }

    this.iniciarCarregamento();

    const payload: { statusAtual: string; observacao: string; responsavel?: string } = {
      statusAtual: this.processoSelecionado.status,
      observacao: this.processoSelecionado.observacao ?? ''
    };

    if (this.processoSelecionado.responsavel) {
      const responsavel = this.processoSelecionado.responsavel.trim();
      if (responsavel) {
        payload.responsavel = responsavel;
      }
    }

    this.processoService.atualizarProcesso(this.processoSelecionado.id, payload).subscribe({
      next: () => {
        console.log(`Processo ${this.processoSelecionado.codigo} atualizado.`);
        this.finalizarCarregamento();
        this.modalGeralAberto = false;
        this.carregarProcessos();
      },
      error: (err) => {
        console.error('Erro ao salvar alteracoes do processo:', err);
        this.finalizarCarregamento();
        alert('Nao foi possivel salvar as alteracoes. Veja o console.');
      }
    });
  }

  salvarEtapa(): void {
    if (!this.etapaSelecionada?.id || !this.etapaSelecionada?.etapa) {
      console.error('Dados da etapa selecionada estao incompletos.');
      alert('Nao foi possivel salvar as alteracoes da etapa. Veja o console.');
      return;
    }

    const processoId = this.etapaSelecionada.id;
    const etapaIdAtual =
      this.etapaSelecionada.etapaId ??
      this.extrairEtapaId(this.etapaSelecionada) ??
      this.extrairEtapaId(this.etapaDetalhesRaw);

    this.iniciarCarregamento();

    const statusNormalizado = (this.etapaSelecionada.status ?? '').trim() || 'Em andamento';
    const payload: {
      status?: string;
      statusEtapa?: string;
      observacao: string;
      responsavel?: string;
    } = {
      status: statusNormalizado,
      statusEtapa: statusNormalizado,
      observacao: this.etapaSelecionada.observacao?.trim() ?? ''
    };

    const responsavel = this.etapaSelecionada.responsavel?.trim();
    if (responsavel) {
      payload.responsavel = responsavel;
    }

    const concluirAtualizacao = (etapaId: number) => {
      this.processoService.atualizarEtapa(etapaId, payload).subscribe({
        next: () => {
          console.log(
            `Etapa ${this.etapaSelecionada.etapa} do processo ${this.etapaSelecionada.codigo} atualizada.`
          );
          this.finalizarCarregamento();
          this.modalEtapaAberto = false;

          this.recarregarDadosPosAcao();
        },
        error: (err) => {
          console.error('Erro ao salvar alteracoes da etapa:', err);
          this.finalizarCarregamento();
          alert('Nao foi possivel salvar as alteracoes da etapa. Veja o console.');
        }
      });
    };

    if (etapaIdAtual) {
      this.etapaSelecionada.etapaId = etapaIdAtual;
      concluirAtualizacao(etapaIdAtual);
      return;
    }

    this.buscarEtapaAtual(processoId).subscribe({
      next: ({ etapaId, dados }) => {
        if (!etapaId) {
          console.error('Nao foi possivel identificar a etapa selecionada para atualizacao.');
          this.finalizarCarregamento();
          alert('Nao foi possivel salvar as alteracoes da etapa. Veja o console.');
          return;
        }

        this.etapaDetalhesRaw = dados;
        this.etapaSelecionada.etapaId = etapaId;
        concluirAtualizacao(etapaId);
      },
      error: (err) => {
        console.error('Erro ao buscar os dados da etapa para atualizacao:', err);
        this.finalizarCarregamento();
        alert('Nao foi possivel salvar as alteracoes da etapa. Veja o console.');
      }
    });
  }

  concluirAvanco(): void {
    const responsavel = this.novoResponsavel.trim();
    if (!responsavel) {
      alert('Informe o responsavel pela proxima etapa.');
      return;
    }

    if (!this.processoAvancar?.id || !this.processoAvancar?.etapa) {
      console.error('Dados insuficientes para avancar a etapa.');
      return;
    }

    const processoId = this.processoAvancar.id;
    const processoCodigo = this.processoAvancar.codigo;
    const etapaAtualNome = this.processoAvancar.etapa;

    this.iniciarCarregamento();

    const proximaConfig = this.obterProximaEtapaConfig(etapaAtualNome);
    const proximaEtapaNome = proximaConfig?.nome ?? etapaAtualNome;
    const proximaEtapaParametro =
      proximaConfig?.parametro ?? this.removerAcentos(etapaAtualNome).toUpperCase();

    const payloadAvanco = {
      responsavel,
      proximaEtapa: proximaEtapaParametro,
      observacao: ''
    };

    const avancarParaProximaEtapa = () => {
      this.processoService.avancarEtapa(processoId, payloadAvanco).subscribe({
        next: (resposta) => {
          console.log(
            `Processo ${processoCodigo} avancado para ${proximaEtapaNome} com responsavel ${responsavel}.`,
            resposta
          );
          this.finalizarCarregamento();
          this.modalAvancarAberto = false;
          this.processoAvancar = null;
          this.novoResponsavel = '';

          this.recarregarDadosPosAcao();
        },
        error: (err) => {
          console.error('Erro ao avancar etapa do processo:', err);
          this.finalizarCarregamento();
          alert('Nao foi possivel avancar a etapa. Veja o console.');
        }
      });
    };

    const normalizarEtapaAtual = (etapaId?: number | null) => {
      if (!etapaId) {
        this.buscarEtapaAtual(processoId).subscribe({
          next: ({ etapaId: etapaIdEncontrado }) => {
            if (!etapaIdEncontrado) {
              console.warn(
                'Nao foi possivel identificar a etapa ativa antes do avanco. Tentando avancar mesmo assim.'
              );
              avancarParaProximaEtapa();
              return;
            }
            normalizarEtapaAtual(etapaIdEncontrado);
          },
          error: (erro) => {
            console.error('Erro ao obter detalhes da etapa antes do avanco:', erro);
            avancarParaProximaEtapa();
          }
        });
        return;
      }

      const payloadEtapaAtual: {
        status?: string;
        statusEtapa?: string;
        observacao: string;
        responsavel?: string;
      } = {
        status: 'Em andamento',
        statusEtapa: 'Em andamento',
        observacao: ''
      };

      const responsavelAtual = this.processoAvancar?.responsavel?.trim();
      if (responsavelAtual) {
        payloadEtapaAtual.responsavel = responsavelAtual;
      }

      this.processoService.atualizarEtapa(etapaId, payloadEtapaAtual).subscribe({
        next: () => {
          avancarParaProximaEtapa();
        },
        error: (erro) => {
          console.warn('Nao foi possivel normalizar a etapa antes do avanco.', erro);
          avancarParaProximaEtapa();
        }
      });
    };

    normalizarEtapaAtual(this.processoAvancar.etapaId ?? null);
  }

  adicionarLinha(): void {
    this.materiais.push(this.criarMaterialEmBranco());
  }

  removerLinha(index: number): void {
    const item = this.materiais[index];
    if (!item) {
      return;
    }

    if (!this.podeRemoverMaterial(item)) {
      alert('Remova apenas linhas em branco.');
      return;
    }

    this.materiais.splice(index, 1);

    if (this.materiais.length === 0) {
      this.materiais.push(this.criarMaterialEmBranco());
    }
  }

  concluirCorte(): void {
    if (!this.processoCorte?.id) {
      console.error('Nao foi possivel identificar o processo para registrar o corte.');
      return;
    }

    const materiaisValidos = this.materiais
      .filter((item) => {
        const possuiDados =
          item.material?.trim() ||
          item.altura?.trim() ||
          item.largura?.trim() ||
          item.espessura?.trim() ||
          item.quantidade?.trim();
        return Boolean(possuiDados);
      })
      .map((item) => ({
        material: item.material.trim(),
        altura: Number(item.altura),
        largura: Number(item.largura),
        espessura: Number(item.espessura),
        quantidade: Number(item.quantidade)
      }));

    if (!materiaisValidos.length) {
      alert('Informe ao menos um material para salvar o corte.');
      return;
    }

    const possuiDadosInvalidos = materiaisValidos.some(
      (item) =>
        !item.material ||
        Number.isNaN(item.altura) ||
        Number.isNaN(item.largura) ||
        Number.isNaN(item.espessura) ||
        Number.isNaN(item.quantidade) ||
        item.altura <= 0 ||
        item.largura <= 0 ||
        item.espessura <= 0 ||
        item.quantidade <= 0
    );

    if (possuiDadosInvalidos) {
      alert('Preencha todos os campos com valores maiores que zero.');
      return;
    }

    const etapaIdAtual = this.processoCorte.etapaId ?? null;
    this.iniciarCarregamento();

    const salvarMateriais = (etapaId: number) => {
      const requisicoes = materiaisValidos.map((item) =>
        this.processoService.salvarDetalhesPreparacao({
          etapaId,
          tipoMaterial: item.material,
          comprimento: item.altura,
          largura: item.largura,
          altura: item.altura,
          espessura: item.espessura,
          quantidade: item.quantidade
        })
      );

      forkJoin(requisicoes).subscribe({
        next: () => {
          this.finalizarCarregamento();
          const materiaisPersistidos = materiaisValidos.map<MaterialCorte>((item) => ({
            material: item.material,
            altura: String(item.altura),
            largura: String(item.largura),
            espessura: String(item.espessura),
            quantidade: String(item.quantidade),
            readonly: true
          }));
          this.materiais = [...materiaisPersistidos.map((item) => ({ ...item })), this.criarMaterialEmBranco()];
          console.log('Detalhes de corte salvos com sucesso.');
        },
        error: (err) => {
          console.error('Erro ao salvar detalhes do corte:', err);
          this.finalizarCarregamento();
          alert('Nao foi possivel salvar os detalhes do corte. Veja o console.');
        }
      });
    };

    if (etapaIdAtual) {
      salvarMateriais(etapaIdAtual);
      return;
    }

    const etapaNome = this.processoCorte.etapa;
    this.resolverEtapaId(this.processoCorte.id, etapaNome).subscribe({
      next: (etapaId) => {
        if (!etapaId) {
          console.error('Nao foi possivel identificar a etapa de preparacao para registrar o corte.');
          this.finalizarCarregamento();
          alert('Nao foi possivel salvar os detalhes do corte. Veja o console.');
          return;
        }

        this.processoCorte.etapaId = etapaId;
        salvarMateriais(etapaId);
      },
      error: (erro) => {
        console.error('Erro ao tentar identificar a etapa de corte:', erro);
        this.finalizarCarregamento();
        alert('Nao foi possivel salvar os detalhes do corte. Veja o console.');
      }
    });
  }

  finalizarProcesso(processo: ProcessoResumo | ProcessoEtapa): void {
    if (!processo?.id) {
      console.error('Nao foi possivel identificar o processo para finalizacao.');
      return;
    }

    this.iniciarCarregamento();

    const payload: { statusAtual: string; observacao: string; responsavel?: string } = {
      statusAtual: 'Finalizado',
      observacao: ''
    };

    const responsavel = processo.responsavel?.trim();
    if (responsavel) {
      payload.responsavel = responsavel;
    }

    this.processoService.atualizarProcesso(processo.id, payload).subscribe({
      next: () => {
        console.log(`Processo ${processo.codigo} finalizado.`);
        this.finalizarCarregamento();

        this.recarregarDadosPosAcao();
      },
      error: (err) => {
        console.error('Erro ao finalizar processo:', err);
        this.finalizarCarregamento();
        alert('Nao foi possivel finalizar o processo. Veja o console.');
      }
    });
  }
}


