namespace IsonelApi.Models
{
    public class Etapa
    {
        public int Id { get; set; }
        public int ProcessoId { get; set; }
        public string TipoEtapa { get; set; } = string.Empty; 
        public string Status { get; set; } = "Pendente";     
        public string Responsavel { get; set; } = string.Empty;
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public string Observacao { get; set; } = string.Empty;

        // Relacionamento
        public Processo? Processo { get; set; }
    }
}
