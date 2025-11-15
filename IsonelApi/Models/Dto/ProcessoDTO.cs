namespace IsonelApi.Models.Dto
{
    public class ProcessoDTO
    {
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
            public string? StatusProcesso { get; set; }
            public string? Responsavel { get; set; }
            public DateTime DataInicio { get; set; }
        }

        public class ProcessoPausadoDto
        {
            public int Id { get; set; }
            public string? Codigo { get; set; }
            public string? Cliente { get; set; }
            public string? Produto { get; set; }
            public string? EstadoAtual { get; set; }
            public string? StatusProcesso { get; set; }
            public string? Responsavel { get; set; }
            public DateTime DataInicio { get; set; }
        }

        public class ProcessoFinalizadoDto
        {
            public int Id { get; set; }
            public string? Codigo { get; set; }
            public string? Cliente { get; set; }
            public string? Produto { get; set; }
            public string? EstadoAtual { get; set; }
            public string? StatusProcesso { get; set; }
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
            public string? StatusProcesso { get; set; }
            public string? Responsavel { get; set; }
            public string? Observacao { get; set; }
            public DateTime DataInicioProcesso { get; set; }
            public DateTime DataInicioEtapa { get; set; }
        }

        public class ProcessoEtapaEmAndamentoDto
        {
            public int ProcessoId { get; set; }
            public int EtapaId { get; set; }
            public string Codigo { get; set; } = string.Empty;
            public string Cliente { get; set; } = string.Empty;
            public string Responsavel { get; set; } = string.Empty;
            public string StatusEtapa { get; set; } = string.Empty;
        }

        public class DetalhesEtapaAtualDto
        {
            public int ProcessoId { get; set; }
            public int EtapaId { get; set; }
            public string Codigo { get; set; } = string.Empty;
            public string Cliente { get; set; } = string.Empty;
            public string Produto { get; set; } = string.Empty;
            public string TipoEtapa { get; set; } = string.Empty;
            public string StatusEtapa { get; set; } = string.Empty;
            public string Responsavel { get; set; } = string.Empty;
            public string Observacao { get; set; } = string.Empty;
            public DateTime DataInicioProcesso { get; set; }
            public DateTime DataInicioEtapa { get; set; }
        }


        public class PesquisaProcessoDto
        {
            public int ProcessoId { get; set; }
            public int? EtapaId { get; set; }
            public string? Codigo { get; set; }
            public string? Cliente { get; set; }
            public string? Produto { get; set; }
            public string? EstadoAtual { get; set; }
            public string? StatusAtual { get; set; }
            public string? Responsavel { get; set; }
            public string? TipoEtapa { get; set; }
            public string? StatusEtapa { get; set; }
            public DateTime DataInicio { get; set; }
        }

        public class DetalhesProcessoFinalizadoDto
        {
            public int ProcessoId { get; set; }
            public string Codigo { get; set; } = string.Empty;
            public string Cliente { get; set; } = string.Empty;
            public string Produto { get; set; } = string.Empty;
            public string StatusProcesso { get; set; } = string.Empty;
            public string Observacao { get; set; } = string.Empty;
            public DateTime DataInicioProcesso { get; set; }
            public DateTime? DataFimProcesso { get; set; }
            public int DuracaoTotalMinutos { get; set; }
            public string DuracaoFormatada { get; set; } = string.Empty;
        }

        public class EtapaProcessoFinalizadoDto
        {
            public int EtapaId { get; set; }
            public string TipoEtapa { get; set; } = string.Empty;
            public string Responsavel { get; set; } = string.Empty;
            public DateTime DataInicioEtapa { get; set; }
            public DateTime? DataFimEtapa { get; set; }
            public int DuracaoMinutos { get; set; }
            public string DuracaoFormatada { get; set; } = string.Empty;
            public string Observacao { get; set; } = string.Empty;
        }

    }
}
