using Microsoft.AspNetCore.Mvc;
using IsonelApi.Data;
using IsonelApi.Models;

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
    }

    public class ProcessoCreateDto
    {
        public string Cliente { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string TipoEtapa { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
    }
}
