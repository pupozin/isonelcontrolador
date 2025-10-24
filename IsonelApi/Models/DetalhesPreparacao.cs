namespace IsonelApi.Models
{
    public class DetalhesPreparacao
    {
        public int Id { get; set; }
        public int EtapaId { get; set; }
        public string TipoMaterial { get; set; } = string.Empty; 
        public decimal Comprimento { get; set; }
        public decimal Largura { get; set; }
        public decimal Altura { get; set; }
        public decimal Espessura { get; set; }
        public int Quantidade { get; set; }

        // Relacionamento
        public Etapa? Etapa { get; set; }
    }
}
