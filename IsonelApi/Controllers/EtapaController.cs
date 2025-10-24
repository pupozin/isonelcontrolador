using Microsoft.AspNetCore.Mvc;
using IsonelApi.Data;
using IsonelApi.Models;

namespace IsonelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EtapaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EtapaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult CriarEtapa([FromBody] EtapaCreateDto dto)
        {
            var processo = _context.Processos.FirstOrDefault(p => p.Id == dto.ProcessoId);
            if (processo == null)
                return NotFound("Processo não encontrado.");

            var etapa = new Etapa
            {
                ProcessoId = processo.Id,
                TipoEtapa = dto.TipoEtapa.ToUpper(),
                Status = "Em andamento",
                Responsavel = dto.Responsavel,
                DataInicio = DateTime.Now,
                Observacao = dto.Observacao
            };

            _context.Etapas.Add(etapa);
            processo.EstadoAtual = dto.TipoEtapa;
            _context.SaveChanges();

            return Ok(new
            {
                message = "Etapa criada com sucesso!",
                etapa.Id,
                etapa.TipoEtapa,
                etapa.Status,
                etapa.Responsavel
            });
        }

        [HttpPut("{id}")]
        public IActionResult AtualizarEtapa(int id, [FromBody] EtapaUpdateDto dto)
        {
            var etapa = _context.Etapas.FirstOrDefault(e => e.Id == id);
            if (etapa == null)
                return NotFound("Etapa não encontrada.");

            if (!string.IsNullOrWhiteSpace(dto.Status))
                etapa.Status = dto.Status;

            if (!string.IsNullOrWhiteSpace(dto.Observacao))
                etapa.Observacao = dto.Observacao;

            if (!string.IsNullOrWhiteSpace(dto.Responsavel))
                etapa.Responsavel = dto.Responsavel;

            _context.SaveChanges();

            return Ok(new
            {
                message = "Etapa atualizada com sucesso!",
                etapa.Id,
                etapa.TipoEtapa,
                etapa.Status,
                etapa.Responsavel,
                etapa.Observacao
            });
        }
    }

    public class EtapaCreateDto
    {
        public int ProcessoId { get; set; }
        public string TipoEtapa { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
    }

    public class EtapaUpdateDto
    {
        public string Status { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
    }
}
