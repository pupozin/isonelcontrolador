namespace IsonelApi.Models
{
    public class HistoricoMovimentacao
    {
        public int Id { get; set; }
        public int ProcessoId { get; set; }
        public string EtapaOrigem { get; set; } = string.Empty;
        public string EtapaDestino { get; set; } = string.Empty;
        public DateTime DataMovimentacao { get; set; } = DateTime.Now;
        public string Usuario { get; set; } = string.Empty;

        // Relacionamento
        public required Processo Processo { get; set; }
    }
}
