namespace IsonelApi.Models.Dto
{
    public class InsightsResumoDto
    {
        public int ProcessosIniciados { get; set; }
        public int ProcessosFinalizados { get; set; }
        public decimal DuracaoMediaProcessoMin { get; set; }
        public decimal DuracaoMedianaProcessoMin { get; set; }
        public decimal DuracaoMediaEtapaMin { get; set; }
    }

    public class InsightsMediaEtapaDto
    {
        public string TipoEtapa { get; set; } = string.Empty;
        public int QtdEtapas { get; set; }
        public decimal DuracaoMediaMin { get; set; }
    }

    public class InsightsProcessoLentoDto
    {
        public int ProcessoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public int DuracaoMinutos { get; set; }
        public string DuracaoFormatada { get; set; } = string.Empty;
    }

    public class InsightsThroughputDiaDto
    {
        public DateTime Dia { get; set; }
        public int ProcessosFinalizados { get; set; }
    }

    public class InsightsResponsavelDto
    {
        public string Responsavel { get; set; } = string.Empty;
        public int QtdEtapas { get; set; }
        public decimal DuracaoMediaMin { get; set; }
    }

    public class InsightsProcessosDto
    {
        public InsightsResumoDto? Resumo { get; set; }
        public List<InsightsMediaEtapaDto> MediasPorEtapa { get; set; } = new();
        public List<InsightsProcessoLentoDto> ProcessosMaisLentos { get; set; } = new();
        public List<InsightsThroughputDiaDto> ThroughputDiario { get; set; } = new();
        public List<InsightsResponsavelDto> Responsaveis { get; set; } = new();
    }
}
