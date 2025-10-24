using IsonelApi.Models; // 👈 importa as classes dos modelos
using Microsoft.EntityFrameworkCore;

namespace IsonelApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Processo> Processos { get; set; }
        public DbSet<Etapa> Etapas { get; set; }
        public DbSet<DetalhesPreparacao> DetalhesPreparacoes { get; set; }
        public DbSet<HistoricoMovimentacao> HistoricoMovimentacoes { get; set; }
    }
}
