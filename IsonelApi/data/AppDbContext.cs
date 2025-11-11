using IsonelApi.Controllers;
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
        public DbSet<ProcessoAndamentoDto> ProcessosAndamento { get; set; }
        public DbSet<ProcessoPausadoDto> ProcessosPausado { get; set; }
        public DbSet<ProcessoFinalizadoDto> ProcessosFinalizado { get; set; }
        public DbSet<DetalhesProcessoAndamentoDto> DetalhesProcessoAndamento { get; set; }
        public DbSet<ProcessoEtapaEmAndamentoDto> ProcessosEtapaEmAndamento { get; set; }
        public DbSet<DetalhesEtapaAtualDto> DetalhesEtapaAtual { get; set; }

        public DbSet<MaterialPreparacaoDto> MaterialPreparacao { get; set; }

        public DbSet<DetalhesProcessoFinalizadoDto> DetalhesProcessoFinalizado { get; set; }
        public DbSet<EtapaProcessoFinalizadoDto> EtapasProcessoFinalizado { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔹 Registra o DTO da procedure (sem chave, sem tabela)
            modelBuilder.Entity<ProcessoAndamentoDto>().HasNoKey();
            modelBuilder.Entity<ProcessoPausadoDto>().HasNoKey();
            modelBuilder.Entity<ProcessoFinalizadoDto>().HasNoKey();
            modelBuilder.Entity<DetalhesProcessoAndamentoDto>().HasNoKey();
            modelBuilder.Entity<ProcessoEtapaEmAndamentoDto>().HasNoKey();
            modelBuilder.Entity<DetalhesEtapaAtualDto>().HasNoKey();
            modelBuilder.Entity<MaterialPreparacaoDto>().HasNoKey();
            modelBuilder.Entity<DetalhesProcessoFinalizadoDto>().HasNoKey();
            modelBuilder.Entity<EtapaProcessoFinalizadoDto>().HasNoKey();

        }
    }
}

