using IsonelApi.Data;
using IsonelApi.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;

namespace IsonelApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsightsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InsightsController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/insights/processos?ano=2025&mes=11
        [HttpGet("processos")]
        public IActionResult ObterInsightsProcessos([FromQuery] int ano, [FromQuery] int mes)
        {
            if (ano <= 0 || mes < 1 || mes > 12)
                return BadRequest("Informe ano e mês válidos.");

            var resultado = new InsightsProcessosDto();

            var connection = _context.Database.GetDbConnection();

            try
            {
                connection.Open();

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC sp_InsightsProcessos @Ano, @Mes";

                    var pAno = command.CreateParameter();
                    pAno.ParameterName = "@Ano";
                    pAno.Value = ano;
                    command.Parameters.Add(pAno);

                    var pMes = command.CreateParameter();
                    pMes.ParameterName = "@Mes";
                    pMes.Value = mes;
                    command.Parameters.Add(pMes);

                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            resultado.Resumo = new InsightsResumoDto
                            {
                                ProcessosIniciados = reader.GetInt32(reader.GetOrdinal("ProcessosIniciados")),
                                ProcessosFinalizados = reader.GetInt32(reader.GetOrdinal("ProcessosFinalizados")),
                                DuracaoMediaProcessoMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaProcessoMin"))
                                    ? 0 : Convert.ToDecimal(reader["DuracaoMediaProcessoMin"]),
                                DuracaoMedianaProcessoMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMedianaProcessoMin"))
                                    ? 0 : Convert.ToDecimal(reader["DuracaoMedianaProcessoMin"]),
                                DuracaoMediaEtapaMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaEtapaMin"))
                                    ? 0 : Convert.ToDecimal(reader["DuracaoMediaEtapaMin"])
                            };
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                resultado.MediasPorEtapa.Add(new InsightsMediaEtapaDto
                                {
                                    TipoEtapa = reader["TipoEtapa"]?.ToString() ?? "",
                                    QtdEtapas = reader.GetInt32(reader.GetOrdinal("QtdEtapas")),
                                    DuracaoMediaMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaMin"))
                                        ? 0 : Convert.ToDecimal(reader["DuracaoMediaMin"])
                                });
                            }
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                resultado.ProcessosMaisLentos.Add(new InsightsProcessoLentoDto
                                {
                                    ProcessoId = reader.GetInt32(reader.GetOrdinal("ProcessoId")),
                                    Codigo = reader["Codigo"]?.ToString() ?? "",
                                    Cliente = reader["Cliente"]?.ToString() ?? "",
                                    Produto = reader["Produto"]?.ToString() ?? "",
                                    DataInicio = reader.GetDateTime(reader.GetOrdinal("DataInicio")),
                                    DataFim = reader.IsDBNull(reader.GetOrdinal("DataFim"))
                                        ? (DateTime?)null
                                        : reader.GetDateTime(reader.GetOrdinal("DataFim")),
                                    DuracaoMinutos = reader.GetInt32(reader.GetOrdinal("DuracaoMinutos")),
                                    DuracaoFormatada = reader["DuracaoFormatada"]?.ToString() ?? ""
                                });
                            }
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                resultado.ThroughputDiario.Add(new InsightsThroughputDiaDto
                                {
                                    Dia = reader.GetDateTime(reader.GetOrdinal("Dia")),
                                    ProcessosFinalizados = reader.GetInt32(reader.GetOrdinal("ProcessosFinalizados"))
                                });
                            }
                        }

                        if (reader.NextResult())
                        {
                            while (reader.Read())
                            {
                                resultado.Responsaveis.Add(new InsightsResponsavelDto
                                {
                                    Responsavel = reader["Responsavel"]?.ToString() ?? "",
                                    QtdEtapas = reader.GetInt32(reader.GetOrdinal("QtdEtapas")),
                                    DuracaoMediaMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaMin"))
                                        ? 0 : Convert.ToDecimal(reader["DuracaoMediaMin"])
                                });
                            }
                        }
                    }
                }
            }
            finally
            {
                connection.Close();
            }

            return Ok(resultado);
        }
    }
}
