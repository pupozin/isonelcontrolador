﻿using IsonelApi.Controllers;
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
        public DbSet<DetalhesProcessoAndamentoDto> DetalhesProcessoAndamento { get; set; }
        public DbSet<ProcessoEtapaEmAndamentoDto> ProcessosEtapaEmAndamento { get; set; }
        public DbSet<DetalhesEtapaAtualDto> DetalhesEtapaAtual { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔹 Registra o DTO da procedure (sem chave, sem tabela)
            modelBuilder.Entity<ProcessoAndamentoDto>().HasNoKey();
            modelBuilder.Entity<DetalhesProcessoAndamentoDto>().HasNoKey();
            modelBuilder.Entity<ProcessoEtapaEmAndamentoDto>().HasNoKey();
            modelBuilder.Entity<DetalhesEtapaAtualDto>().HasNoKey();
        }
    }
}

