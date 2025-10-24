namespace IsonelApi.Models
{
    public class Processo
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Produto { get; set; } = string.Empty;
        public string EstadoAtual { get; set; } = string.Empty;
        public string StatusAtual { get; set; } = "Em andamento";
        public DateTime DataInicio { get; set; } = DateTime.Now;
        public DateTime? DataFim { get; set; }
        public string Observacao { get; set; } = string.Empty;

        public ICollection<Etapa> Etapas { get; set; } = new List<Etapa>();
    }
}
