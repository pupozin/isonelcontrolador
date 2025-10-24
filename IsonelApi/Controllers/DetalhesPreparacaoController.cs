using Microsoft.AspNetCore.Mvc;
using IsonelApi.Data;
using IsonelApi.Models;

namespace IsonelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DetalhesPreparacaoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DetalhesPreparacaoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult AdicionarDetalhes([FromBody] DetalhesPreparacaoCreateDto dto)
        {
            var etapa = _context.Etapas.FirstOrDefault(e => e.Id == dto.EtapaId);
            if (etapa == null)
                return NotFound("Etapa não encontrada.");

            var detalhes = new DetalhesPreparacao
            {
                EtapaId = etapa.Id,
                TipoMaterial = dto.TipoMaterial,
                Comprimento = dto.Comprimento,
                Largura = dto.Largura,
                Altura = dto.Altura,
                Espessura = dto.Espessura,
                Quantidade = dto.Quantidade
            };

            _context.DetalhesPreparacoes.Add(detalhes);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Detalhes de preparação adicionados com sucesso!",
                detalhes.Id,
                detalhes.TipoMaterial,
                detalhes.Quantidade
            });
        }
    }

    public class DetalhesPreparacaoCreateDto
    {
        public int EtapaId { get; set; }
        public string TipoMaterial { get; set; } = string.Empty;
        public decimal Comprimento { get; set; }
        public decimal Largura { get; set; }
        public decimal Altura { get; set; }
        public decimal Espessura { get; set; }
        public int Quantidade { get; set; }
        public string Observacao { get; set; } = string.Empty;
    }
}
