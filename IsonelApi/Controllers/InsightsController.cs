using System;
using System.Data;
using System.Globalization;
using System.Text;
using IsonelApi.Data;
using IsonelApi.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet("processos")]
        public IActionResult ObterInsightsProcessos([FromQuery] int ano, [FromQuery] int mes)
        {
            if (!ParametrosValidos(ano, mes))
            {
                return BadRequest("Informe ano e mês válidos.");
            }

            var resultado = ConsultarInsightsProcessos(ano, mes);
            return Ok(resultado);
        }

        [HttpGet("processos/export")]
        public IActionResult ExportarInsightsProcessosCsv([FromQuery] int ano, [FromQuery] int mes)
        {
            if (!ParametrosValidos(ano, mes))
            {
                return BadRequest("Informe ano e mês válidos.");
            }

            var resultado = ConsultarInsightsProcessos(ano, mes);
            var csv = GerarCsvInsights(resultado);
            var nomeArquivo = $"insights-{ano}-{mes:D2}.csv";
            return File(Encoding.UTF8.GetBytes(csv), "text/csv", nomeArquivo);
        }

        private bool ParametrosValidos(int ano, int mes) => ano >= 2000 && ano <= 2100 && mes >= 1 && mes <= 12;

        private InsightsProcessosDto ConsultarInsightsProcessos(int ano, int mes)
        {
            var resultado = new InsightsProcessosDto { Resumo = new InsightsResumoDto() };
            var connection = _context.Database.GetDbConnection();

            try
            {
                connection.Open();
                using var command = connection.CreateCommand();
                command.CommandText = "EXEC sp_InsightsProcessos @Ano, @Mes";

                var pAno = command.CreateParameter();
                pAno.ParameterName = "@Ano";
                pAno.DbType = DbType.Int32;
                pAno.Value = ano;
                command.Parameters.Add(pAno);

                var pMes = command.CreateParameter();
                pMes.ParameterName = "@Mes";
                pMes.DbType = DbType.Int32;
                pMes.Value = mes;
                command.Parameters.Add(pMes);

                using var reader = command.ExecuteReader();

                if (reader.Read())
                {
                    resultado.Resumo = new InsightsResumoDto
                    {
                        ProcessosIniciados = reader.IsDBNull(reader.GetOrdinal("ProcessosIniciados"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("ProcessosIniciados")),
                        ProcessosFinalizados = reader.IsDBNull(reader.GetOrdinal("ProcessosFinalizados"))
                            ? 0
                            : reader.GetInt32(reader.GetOrdinal("ProcessosFinalizados")),
                        DuracaoMediaProcessoMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaProcessoMin"))
                            ? null
                            : reader.GetDecimal(reader.GetOrdinal("DuracaoMediaProcessoMin")),
                        DuracaoMedianaProcessoMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMedianaProcessoMin"))
                            ? null
                            : reader.GetDecimal(reader.GetOrdinal("DuracaoMedianaProcessoMin")),
                        DuracaoMediaEtapaMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaEtapaMin"))
                            ? null
                            : reader.GetDecimal(reader.GetOrdinal("DuracaoMediaEtapaMin"))
                    };
                }

                if (reader.NextResult())
                {
                    while (reader.Read())
                    {
                        resultado.MediasPorEtapa.Add(new InsightsMediaEtapaDto
                        {
                            TipoEtapa = reader["TipoEtapa"]?.ToString() ?? string.Empty,
                            QtdEtapas = reader.GetInt32(reader.GetOrdinal("QtdEtapas")),
                            DuracaoMediaMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaMin"))
                                ? null
                                : reader.GetDecimal(reader.GetOrdinal("DuracaoMediaMin"))
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
                            Codigo = reader["Codigo"]?.ToString() ?? string.Empty,
                            Cliente = reader["Cliente"]?.ToString() ?? string.Empty,
                            Produto = reader["Produto"]?.ToString() ?? string.Empty,
                            DataInicio = reader.GetDateTime(reader.GetOrdinal("DataInicio")),
                            DataFim = reader.IsDBNull(reader.GetOrdinal("DataFim"))
                                ? (DateTime?)null
                                : reader.GetDateTime(reader.GetOrdinal("DataFim")),
                            DuracaoMinutos = reader.GetInt32(reader.GetOrdinal("DuracaoMinutos")),
                            DuracaoFormatada = reader["DuracaoFormatada"]?.ToString() ?? string.Empty
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
                            Responsavel = reader["Responsavel"]?.ToString() ?? string.Empty,
                            QtdEtapas = reader.GetInt32(reader.GetOrdinal("QtdEtapas")),
                            DuracaoMediaMin = reader.IsDBNull(reader.GetOrdinal("DuracaoMediaMin"))
                                ? null
                                : reader.GetDecimal(reader.GetOrdinal("DuracaoMediaMin"))
                        });
                    }
                }
            }
            finally
            {
                connection.Close();
            }

            return resultado;
        }

        private static string GerarCsvInsights(InsightsProcessosDto dados)
        {
            const string sep = ";";
            var sb = new StringBuilder();
            sb.AppendLine($"Secao{sep}Campo{sep}Valor");
            sb.AppendLine(
                $"Resumo{sep}ProcessosIniciados{sep}{dados.Resumo?.ProcessosIniciados.ToString(CultureInfo.InvariantCulture) ?? "0"}");
            sb.AppendLine(
                $"Resumo{sep}ProcessosFinalizados{sep}{dados.Resumo?.ProcessosFinalizados.ToString(CultureInfo.InvariantCulture) ?? "0"}");
            sb.AppendLine($"Resumo{sep}DuracaoMediaProcessoMin{sep}{FormatDecimal(dados.Resumo?.DuracaoMediaProcessoMin)}");
            sb.AppendLine($"Resumo{sep}DuracaoMedianaProcessoMin{sep}{FormatDecimal(dados.Resumo?.DuracaoMedianaProcessoMin)}");
            sb.AppendLine($"Resumo{sep}DuracaoMediaEtapaMin{sep}{FormatDecimal(dados.Resumo?.DuracaoMediaEtapaMin)}");
            sb.AppendLine();

            sb.AppendLine($"Secao{sep}TipoEtapa{sep}QtdEtapas{sep}DuracaoMediaMin");
            foreach (var etapa in dados.MediasPorEtapa)
            {
                sb.AppendLine(
                    $"MediasPorEtapa{sep}{Csv(etapa.TipoEtapa, sep)}{sep}{etapa.QtdEtapas.ToString(CultureInfo.InvariantCulture)}{sep}{FormatDecimal(etapa.DuracaoMediaMin)}");
            }
            sb.AppendLine();

            sb.AppendLine($"Secao{sep}ProcessoId{sep}Codigo{sep}Cliente{sep}Produto{sep}DataInicio{sep}DataFim{sep}DuracaoMinutos{sep}DuracaoFormatada");
            foreach (var proc in dados.ProcessosMaisLentos)
            {
                var dataFim = proc.DataFim.HasValue ? proc.DataFim.Value.ToString("s") : string.Empty;
                sb.AppendLine(
                    $"ProcessosMaisLentos{sep}{proc.ProcessoId.ToString(CultureInfo.InvariantCulture)}{sep}{Csv(proc.Codigo, sep)}{sep}{Csv(proc.Cliente, sep)}{sep}{Csv(proc.Produto, sep)}{sep}{proc.DataInicio.ToString("s")}{sep}{dataFim}{sep}{proc.DuracaoMinutos.ToString(CultureInfo.InvariantCulture)}{sep}{Csv(proc.DuracaoFormatada, sep)}");
            }
            sb.AppendLine();

            sb.AppendLine($"Secao{sep}Dia{sep}ProcessosFinalizados");
            foreach (var dia in dados.ThroughputDiario)
            {
                sb.AppendLine(
                    $"ThroughputDiario{sep}{dia.Dia.ToString("yyyy-MM-dd")}{sep}{dia.ProcessosFinalizados.ToString(CultureInfo.InvariantCulture)}");
            }
            sb.AppendLine();

            sb.AppendLine($"Secao{sep}Responsavel{sep}QtdEtapas{sep}DuracaoMediaMin");
            foreach (var resp in dados.Responsaveis)
            {
                sb.AppendLine(
                    $"Responsaveis{sep}{Csv(resp.Responsavel, sep)}{sep}{resp.QtdEtapas.ToString(CultureInfo.InvariantCulture)}{sep}{FormatDecimal(resp.DuracaoMediaMin)}");
            }

            return sb.ToString();
        }

        private static string Csv(string? valor, string sep)
        {
            if (string.IsNullOrEmpty(valor))
            {
                return string.Empty;
            }

            var precisa = valor.Contains(sep) || valor.Contains('"') || valor.Contains('\n');
            var normalizado = valor.Replace("\"", "\"\"");
            return precisa ? $"\"{normalizado}\"" : normalizado;
        }

        private static string FormatDecimal(decimal? valor)
        {
            return valor?.ToString("0.##", CultureInfo.InvariantCulture) ?? string.Empty;
        }
    }
}
