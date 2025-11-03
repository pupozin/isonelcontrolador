using Microsoft.AspNetCore.Mvc;
using IsonelApi.Data;
using IsonelApi.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

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

        [HttpPost("salvar-lote")]
        public IActionResult SalvarLote([FromBody] DetalhesPreparacaoLoteDto dto)
        {
            if (dto == null || dto.Materiais == null)
                return BadRequest("Dados do corte n�o informados.");

            var etapa = _context.Etapas.FirstOrDefault(e => e.Id == dto.EtapaId);
            if (etapa == null)
                return NotFound("Etapa n�o encontrada.");

            var materiaisValidos = dto.Materiais
                .Where(item =>
                    item != null &&
                    !string.IsNullOrWhiteSpace(item.TipoMaterial) &&
                    item.Quantidade > 0 &&
                    item.Altura > 0 &&
                    item.Largura > 0 &&
                    item.Espessura > 0)
                .ToList();

            if (!materiaisValidos.Any())
                return BadRequest("Nenhum material v�lido informado para o corte.");

            using var transacao = _context.Database.BeginTransaction();
            try
            {
                var existentes = _context.DetalhesPreparacoes.Where(d => d.EtapaId == etapa.Id);
                _context.DetalhesPreparacoes.RemoveRange(existentes);

                foreach (var item in materiaisValidos)
                {
                    var detalhe = new DetalhesPreparacao
                    {
                        EtapaId = etapa.Id,
                        TipoMaterial = item.TipoMaterial,
                        Comprimento = item.Comprimento > 0 ? item.Comprimento : item.Altura,
                        Largura = item.Largura,
                        Altura = item.Altura,
                        Espessura = item.Espessura,
                        Quantidade = item.Quantidade
                    };
                    _context.DetalhesPreparacoes.Add(detalhe);
                }

                _context.SaveChanges();
                transacao.Commit();

                return Ok(new
                {
                    message = "Detalhes de corte registrados com sucesso!",
                    etapaId = etapa.Id,
                    quantidade = materiaisValidos.Count
                });
            }
            catch (Exception ex)
            {
                transacao.Rollback();
                return StatusCode(500, $"Erro ao salvar detalhes do corte: {ex.Message}");
            }
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

    public class DetalhesPreparacaoItemDto
    {
        public string TipoMaterial { get; set; } = string.Empty;
        public decimal Comprimento { get; set; }
        public decimal Largura { get; set; }
        public decimal Altura { get; set; }
        public decimal Espessura { get; set; }
        public int Quantidade { get; set; }
    }

    public class DetalhesPreparacaoLoteDto
    {
        public int EtapaId { get; set; }
        public List<DetalhesPreparacaoItemDto> Materiais { get; set; } = new();
    }
}
