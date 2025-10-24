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

        [HttpPut("{id}")]
        public IActionResult AtualizarDetalhes(int id, [FromBody] DetalhesPreparacaoUpdateDto dto)
        {
            var detalhes = _context.DetalhesPreparacoes.FirstOrDefault(d => d.Id == id);
            if (detalhes == null)
                return NotFound("Detalhes de preparação não encontrados.");

            if (!string.IsNullOrWhiteSpace(dto.TipoMaterial))
                detalhes.TipoMaterial = dto.TipoMaterial;

            if (dto.Comprimento > 0) detalhes.Comprimento = dto.Comprimento;
            if (dto.Largura > 0) detalhes.Largura = dto.Largura;
            if (dto.Altura > 0) detalhes.Altura = dto.Altura;
            if (dto.Espessura > 0) detalhes.Espessura = dto.Espessura;
            if (dto.Quantidade > 0) detalhes.Quantidade = dto.Quantidade;

            _context.SaveChanges();

            return Ok(new
            {
                message = "Detalhes de preparação atualizados com sucesso!",
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

    public class DetalhesPreparacaoUpdateDto
    {
        public string TipoMaterial { get; set; } = string.Empty;
        public decimal Comprimento { get; set; }
        public decimal Largura { get; set; }
        public decimal Altura { get; set; }
        public decimal Espessura { get; set; }
        public int Quantidade { get; set; }
        public string Observacao { get; set; } = string.Empty;
    }
}
