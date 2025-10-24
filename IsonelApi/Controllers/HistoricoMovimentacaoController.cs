using Microsoft.AspNetCore.Mvc;
using IsonelApi.Data;
using IsonelApi.Models;

namespace IsonelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoricoMovimentacaoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoricoMovimentacaoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult Registrar([FromBody] HistoricoCreateDto dto)
        {
            var processo = _context.Processos.FirstOrDefault(p => p.Id == dto.ProcessoId);
            if (processo == null)
                return NotFound("Processo não encontrado.");

            var historico = new HistoricoMovimentacao
            {
                ProcessoId = processo.Id,
                EtapaOrigem = dto.EtapaOrigem,
                EtapaDestino = dto.EtapaDestino,
                Usuario = dto.Usuario,
                DataMovimentacao = DateTime.Now
            };

            _context.HistoricoMovimentacoes.Add(historico);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Movimentação registrada com sucesso!",
                historico.Id,
                historico.EtapaOrigem,
                historico.EtapaDestino,
                historico.Usuario
            });
        }
    }

    public class HistoricoCreateDto
    {
        public int ProcessoId { get; set; }
        public string EtapaOrigem { get; set; } = string.Empty;
        public string EtapaDestino { get; set; } = string.Empty;
        public string Usuario { get; set; } = string.Empty;
    }
}
