using System;
using IsonelApi.Data;
using IsonelApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IsonelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProcessoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProcessoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult CriarProcesso([FromBody] ProcessoCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Dados inv�lidos.");

            // Define etapa inicial (caso n�o enviada, assume "VENDA")
            var etapaInicial = string.IsNullOrWhiteSpace(dto.TipoEtapa) ? "VENDA" : dto.TipoEtapa.ToUpper();

            // Gera c�digo autom�tico
            var total = _context.Processos.Count() + 1;
            var codigoGerado = $"Processo #{total.ToString("D5")}";

            // Cria processo
            var processo = new Processo
            {
                Codigo = codigoGerado,
                Cliente = dto.Cliente,
                Produto = dto.Produto,
                EstadoAtual = etapaInicial,
                StatusAtual = "Em andamento",
                Observacao = dto.Observacao,
                DataInicio = DateTime.Now
            };

            _context.Processos.Add(processo);
            _context.SaveChanges();

            // Cria a primeira etapa vinculada
            var etapa = new Etapa
            {
                ProcessoId = processo.Id,
                TipoEtapa = etapaInicial,
                Status = "Em andamento",
                Responsavel = dto.Responsavel,
                DataInicio = DateTime.Now,
                Observacao = dto.Observacao
            };

            _context.Etapas.Add(etapa);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Processo criado com sucesso!",
                processo.Id,
                processo.Codigo,
                processo.Cliente,
                processo.Produto,
                processo.EstadoAtual,
                etapaId = etapa.Id,
                etapa.TipoEtapa,
                etapa.Responsavel
            });
        }

        [HttpPut("{id}")]
        public IActionResult AtualizarProcesso(int id, [FromBody] ProcessoUpdateDto dto)
        {
            var processo = _context.Processos.FirstOrDefault(p => p.Id == id);
            if (processo == null)
                return NotFound("Processo n�o encontrado.");

            if (!string.IsNullOrWhiteSpace(dto.Observacao))
                processo.Observacao = dto.Observacao;

            if (!string.IsNullOrWhiteSpace(dto.StatusAtual))
            {
                var statusAtual = dto.StatusAtual.Trim();
                processo.StatusAtual = statusAtual;

                if (string.Equals(statusAtual, "Finalizado", StringComparison.OrdinalIgnoreCase))
                {
                    processo.DataFim = DateTime.Now;

                    var etapaAtual = _context.Etapas
                        .Where(e => e.ProcessoId == processo.Id && e.Status != "Finalizado")
                        .OrderByDescending(e => e.Id)
                        .FirstOrDefault()
                        ?? _context.Etapas
                            .Where(e => e.ProcessoId == processo.Id)
                            .OrderByDescending(e => e.Id)
                            .FirstOrDefault();

                    if (etapaAtual != null)
                    {
                        etapaAtual.Status = "Finalizado";
                        etapaAtual.DataFim = DateTime.Now;
                    }
                }
            }

            _context.SaveChanges();

            return Ok(new
            {
                message = "Processo atualizado com sucesso!",
                processo.Id,
                processo.Codigo,
                processo.StatusAtual,
                processo.Observacao
            });
        }

        [HttpPost("{id}/avancar-etapa")]
        public IActionResult AvancarEtapa(int id, [FromBody] AvancarEtapaDto dto)
        {
            var processo = _context.Processos.FirstOrDefault(p => p.Id == id);
            if (processo == null)
                return NotFound("Processo n�o encontrado.");

            // Recupera a etapa corrente (prioriza status diferente de Finalizado)
            var etapaAtual = _context.Etapas
                .Where(e => e.ProcessoId == processo.Id && e.Status != "Finalizado")
                .OrderByDescending(e => e.Id)
                .FirstOrDefault()
                ?? _context.Etapas
                    .Where(e => e.ProcessoId == processo.Id)
                    .OrderByDescending(e => e.Id)
                    .FirstOrDefault();

            if (etapaAtual == null)
                return BadRequest("Nenhuma etapa encontrada para este processo.");

            // Finaliza a etapa atual
            etapaAtual.Status = "Finalizado";
            etapaAtual.Observacao = dto.Observacao ?? etapaAtual.Observacao;
            etapaAtual.DataFim = DateTime.Now;

            // Determina a pr�xima etapa (simples por agora, podemos evoluir depois)
            string proximaEtapa = dto.ProximaEtapa?.ToUpper() ?? "PROXIMA";

            // Cria nova etapa
            var novaEtapa = new Etapa
            {
                ProcessoId = processo.Id,
                TipoEtapa = proximaEtapa,
                Status = "Em andamento",
                Responsavel = dto.Responsavel,
                DataInicio = DateTime.Now,
                Observacao = ""
            };
            _context.Etapas.Add(novaEtapa);

            // Atualiza processo
            processo.EstadoAtual = proximaEtapa;
            processo.StatusAtual = "Em andamento";

            // Registra hist�rico
            var historico = new HistoricoMovimentacao
            {
                ProcessoId = processo.Id,
                EtapaOrigem = etapaAtual.TipoEtapa,
                EtapaDestino = proximaEtapa,
                Usuario = dto.Responsavel,
                DataMovimentacao = DateTime.Now
            };
            _context.HistoricoMovimentacoes.Add(historico);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Etapa avan�ada com sucesso!",
                processo.Id,
                processo.Codigo,
                etapaAnterior = etapaAtual.TipoEtapa,
                novaEtapa = novaEtapa.TipoEtapa,
                novaEtapaId = novaEtapa.Id,
                historicoId = historico.Id
            });
        }

        //Retorna Processo em andamento

        [HttpGet("andamento")]
        public IActionResult ListarProcessosAndamento()
        {
            var lista = _context.Set<ProcessoAndamentoDto>()
                .FromSqlRaw("EXEC sp_ListarProcessosAndamento")
                .ToList();

            return Ok(lista);
        }


        //Retorna Processo pausado

        [HttpGet("pausado")]
        public IActionResult ListarProcessosPausado()
        {
            var lista = _context.Set<ProcessoPausadoDto>()
                .FromSqlRaw("EXEC sp_ListarProcessosPausado")
                .ToList();
            return Ok(lista);
        }

        //Retorna Processo Finalizado

        [HttpGet("finalizado")]
        public IActionResult ListarProcessosFinalizado()
        {
            var lista = _context.Set<ProcessoFinalizadoDto>()
                .FromSqlRaw("EXEC sp_ListarProcessosFinalizado")
                .ToList();
            return Ok(lista);
        }

        //Retorna detalhes Processo em andamento
        [HttpGet("{id}/detalhes")]
        public IActionResult ObterDetalhesProcessoAndamento(int id)
        {
            var detalhes = _context.DetalhesProcessoAndamento
                .FromSqlRaw("EXEC sp_ListarDetalhesProcessoAndamento @p0", id)
                .AsEnumerable() 
                .FirstOrDefault();

            if (detalhes == null)
                return NotFound("Detalhes do processo n�o encontrados.");

            return Ok(detalhes);
        }

        //Retorna dados da etapa atual selecionada 
        [HttpGet("etapa/andamento/{tipoEtapa}")]
        public IActionResult ListarProcessosEtapaEmAndamento(string tipoEtapa)
        {
            var lista = _context.ProcessosEtapaEmAndamento
                .FromSqlRaw("EXEC sp_ListarProcessosEtapaEmAndamento @p0", tipoEtapa)
                .AsEnumerable()
                .ToList();

            return Ok(lista);
        }

        //Retorna detalhes da etapa atual de um processo
        [HttpGet("{id}/detalhes-etapa")]
        public IActionResult ObterDetalhesEtapaAtual(int id)
        {
            var detalhes = _context.DetalhesEtapaAtual
                .FromSqlRaw("EXEC sp_ListarDetalhesEtapaAtual @p0", id)
                .AsEnumerable()
                .FirstOrDefault();

            if (detalhes == null)
                return NotFound("Nenhuma etapa encontrada para este processo.");

            return Ok(detalhes);
        }

        // pesquisa de processos 
        [HttpGet("pesquisar")]
        public IActionResult PesquisarProcessos([FromQuery] string termo)
        {
            if (string.IsNullOrWhiteSpace(termo))
                return BadRequest("Informe um termo para pesquisa.");

            var connection = _context.Database.GetDbConnection();
            var resultados = new List<PesquisaProcessoDto>();

            try
            {
                connection.Open();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC sp_PesquisarProcessos @Termo";
                    var param = command.CreateParameter();
                    param.ParameterName = "@Termo";
                    param.Value = termo;
                    command.Parameters.Add(param);

                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            resultados.Add(new PesquisaProcessoDto
                            {
                                ProcessoId = reader.GetInt32(reader.GetOrdinal("ProcessoId")),
                                EtapaId = reader.IsDBNull(reader.GetOrdinal("EtapaId")) ? null : reader.GetInt32(reader.GetOrdinal("EtapaId")),
                                Codigo = reader["Codigo"]?.ToString(),
                                Cliente = reader["Cliente"]?.ToString(),
                                Produto = reader["Produto"]?.ToString(),
                                EstadoAtual = reader["EstadoAtual"]?.ToString(),
                                StatusAtual = reader["StatusAtual"]?.ToString(),
                                Responsavel = reader["Responsavel"]?.ToString(),
                                TipoEtapa = reader["TipoEtapa"]?.ToString(),
                                StatusEtapa = reader["StatusEtapa"]?.ToString(),
                                DataInicio = reader.GetDateTime(reader.GetOrdinal("DataInicio"))
                            });
                        }
                    }
                }
            }
            finally
            {
                connection.Close();
            }

            return Ok(resultados);
        }

        // Retorna detalhes do processo finalizado
        [HttpGet("{id}/detalhes-finalizado")]
        public IActionResult ObterDetalhesProcessoFinalizado(int id)
        {
            var detalhes = _context.DetalhesProcessoFinalizado
                .FromSqlRaw("EXEC sp_ListarDetalhesProcessoFinalizado @p0", id)
                .AsEnumerable()
                .FirstOrDefault();

            if (detalhes == null)
                return NotFound("Processo n�o encontrado ou n�o est� finalizado.");

            return Ok(detalhes);
        }

        // Retorna as etapas de um processo finalizado
        [HttpGet("{id}/etapas-finalizado")]
        public IActionResult ObterEtapasProcessoFinalizado(int id)
        {
            var etapas = _context.EtapasProcessoFinalizado
                .FromSqlRaw("EXEC sp_ListarEtapasProcessoFinalizado @p0", id)
                .AsEnumerable()
                .ToList();

            if (etapas == null || !etapas.Any())
                return NotFound("Nenhuma etapa encontrada para este processo.");

            return Ok(etapas);
        }
    }

    public class ProcessoCreateDto
    {
        public string Cliente { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string TipoEtapa { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
    }

    public class ProcessoUpdateDto
    {
        public string Observacao { get; set; } = string.Empty;
        public string StatusAtual { get; set; } = string.Empty;
    }

    public class AvancarEtapaDto
    {
        public string? ProximaEtapa { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public string? Observacao { get; set; }
    }

    public class ProcessoAndamentoDto
    {
        public int Id { get; set; }
        public string? Codigo { get; set; }
        public string? Cliente { get; set; }
        public string? Produto { get; set; }
        public string? EstadoAtual { get; set; }
        public string? StatusProcesso { get; set; }
        public string? Responsavel { get; set; }
        public DateTime DataInicio { get; set; }
    }

    public class ProcessoPausadoDto
    {
        public int Id { get; set; }
        public string? Codigo { get; set; }
        public string? Cliente { get; set; }
        public string? Produto { get; set; }
        public string? EstadoAtual { get; set; }
        public string? StatusProcesso { get; set; }
        public string? Responsavel { get; set; }
        public DateTime DataInicio { get; set; }
    }

    public class ProcessoFinalizadoDto
    {
        public int Id { get; set; }
        public string? Codigo { get; set; }
        public string? Cliente { get; set; }
        public string? Produto { get; set; }
        public string? EstadoAtual { get; set; }
        public string? StatusProcesso { get; set; }
        public string? Responsavel { get; set; }
        public DateTime DataInicio { get; set; }
    }


    public class DetalhesProcessoAndamentoDto
    {
        public int ProcessoId { get; set; }
        public string? Codigo { get; set; }
        public string? Cliente { get; set; }
        public string? Produto { get; set; }
        public string? EstadoAtual { get; set; }
        public string? StatusProcesso { get; set; }
        public string? Responsavel { get; set; }
        public string? Observacao { get; set; }
        public DateTime DataInicioProcesso { get; set; }
        public DateTime DataInicioEtapa { get; set; }
    }

    public class ProcessoEtapaEmAndamentoDto
    {
        public int ProcessoId { get; set; }
        public int EtapaId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string StatusEtapa { get; set; } = string.Empty;
    }

    public class DetalhesEtapaAtualDto
    {
        public int ProcessoId { get; set; }
        public int EtapaId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public string TipoEtapa { get; set; } = string.Empty;
        public string StatusEtapa { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
        public DateTime DataInicioProcesso { get; set; }
        public DateTime DataInicioEtapa { get; set; }
    }


    public class PesquisaProcessoDto
    {
        public int ProcessoId { get; set; }
        public int? EtapaId { get; set; }
        public string? Codigo { get; set; }
        public string? Cliente { get; set; }
        public string? Produto { get; set; }
        public string? EstadoAtual { get; set; }
        public string? StatusAtual { get; set; }
        public string? Responsavel { get; set; }
        public string? TipoEtapa { get; set; }
        public string? StatusEtapa { get; set; }
        public DateTime DataInicio { get; set; }
    }

    public class DetalhesProcessoFinalizadoDto
    {
        public int ProcessoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public string StatusProcesso { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
        public DateTime DataInicioProcesso { get; set; }
        public DateTime? DataFimProcesso { get; set; }
        public int DuracaoTotalMinutos { get; set; }
        public string DuracaoFormatada { get; set; } = string.Empty;
    }

    public class EtapaProcessoFinalizadoDto
    {
        public int EtapaId { get; set; }
        public string TipoEtapa { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public DateTime DataInicioEtapa { get; set; }
        public DateTime? DataFimEtapa { get; set; }
        public int DuracaoMinutos { get; set; }
        public string DuracaoFormatada { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
    }


}



