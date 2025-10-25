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
                return BadRequest("Dados inválidos.");

            // Define etapa inicial (caso não enviada, assume "VENDA")
            var etapaInicial = string.IsNullOrWhiteSpace(dto.TipoEtapa) ? "VENDA" : dto.TipoEtapa.ToUpper();

            // Gera código automático
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
                return NotFound("Processo não encontrado.");

            if (!string.IsNullOrWhiteSpace(dto.Observacao))
                processo.Observacao = dto.Observacao;

            if (!string.IsNullOrWhiteSpace(dto.StatusAtual))
                processo.StatusAtual = dto.StatusAtual;

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
                return NotFound("Processo não encontrado.");

            // Etapa atual em andamento
            var etapaAtual = _context.Etapas
                .Where(e => e.ProcessoId == processo.Id && e.Status == "Em andamento")
                .OrderByDescending(e => e.Id)
                .FirstOrDefault();

            if (etapaAtual == null)
                return BadRequest("Nenhuma etapa em andamento encontrada para este processo.");

            // Finaliza a etapa atual
            etapaAtual.Status = "Finalizado";
            etapaAtual.Observacao = dto.Observacao ?? etapaAtual.Observacao;

            // Determina a próxima etapa (simples por agora, podemos evoluir depois)
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
            etapaAtual.Status = "Finalizado";
            etapaAtual.DataFim = DateTime.Now;


            // Registra histórico
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
                message = "Etapa avançada com sucesso!",
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

        //Retorna detalhes Processo em andamento
        [HttpGet("{id}/detalhes")]
        public IActionResult ObterDetalhesProcessoAndamento(int id)
        {
            var detalhes = _context.DetalhesProcessoAndamento
                .FromSqlRaw("EXEC sp_ListarDetalhesProcessoAndamento @p0", id)
                .AsEnumerable() 
                .FirstOrDefault();

            if (detalhes == null)
                return NotFound("Detalhes do processo não encontrados.");

            return Ok(detalhes);
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
        public string? StatusEtapa { get; set; }
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
        public string? StatusEtapa { get; set; }
        public string? Responsavel { get; set; }
        public string? Observacao { get; set; }
        public DateTime DataInicioProcesso { get; set; }
        public DateTime DataInicioEtapa { get; set; }
    }

}
