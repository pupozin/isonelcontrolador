using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsonelApi.Migrations
{
    /// <inheritdoc />
    public partial class EstruturaCompleta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cliente",
                table: "Processos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataFim",
                table: "Processos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataInicio",
                table: "Processos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "EstadoAtual",
                table: "Processos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Observacao",
                table: "Processos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Produto",
                table: "Processos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StatusAtual",
                table: "Processos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataMovimentacao",
                table: "HistoricoMovimentacoes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "EtapaDestino",
                table: "HistoricoMovimentacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EtapaOrigem",
                table: "HistoricoMovimentacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Usuario",
                table: "HistoricoMovimentacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataFim",
                table: "Etapas",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataInicio",
                table: "Etapas",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observacao",
                table: "Etapas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Responsavel",
                table: "Etapas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Etapas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TipoEtapa",
                table: "Etapas",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Altura",
                table: "DetalhesPreparacoes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Comprimento",
                table: "DetalhesPreparacoes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Espessura",
                table: "DetalhesPreparacoes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Largura",
                table: "DetalhesPreparacoes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "Quantidade",
                table: "DetalhesPreparacoes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TipoMaterial",
                table: "DetalhesPreparacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricoMovimentacoes_ProcessoId",
                table: "HistoricoMovimentacoes",
                column: "ProcessoId");

            migrationBuilder.CreateIndex(
                name: "IX_Etapas_ProcessoId",
                table: "Etapas",
                column: "ProcessoId");

            migrationBuilder.CreateIndex(
                name: "IX_DetalhesPreparacoes_EtapaId",
                table: "DetalhesPreparacoes",
                column: "EtapaId");

            migrationBuilder.AddForeignKey(
                name: "FK_DetalhesPreparacoes_Etapas_EtapaId",
                table: "DetalhesPreparacoes",
                column: "EtapaId",
                principalTable: "Etapas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Etapas_Processos_ProcessoId",
                table: "Etapas",
                column: "ProcessoId",
                principalTable: "Processos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricoMovimentacoes_Processos_ProcessoId",
                table: "HistoricoMovimentacoes",
                column: "ProcessoId",
                principalTable: "Processos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DetalhesPreparacoes_Etapas_EtapaId",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Etapas_Processos_ProcessoId",
                table: "Etapas");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricoMovimentacoes_Processos_ProcessoId",
                table: "HistoricoMovimentacoes");

            migrationBuilder.DropIndex(
                name: "IX_HistoricoMovimentacoes_ProcessoId",
                table: "HistoricoMovimentacoes");

            migrationBuilder.DropIndex(
                name: "IX_Etapas_ProcessoId",
                table: "Etapas");

            migrationBuilder.DropIndex(
                name: "IX_DetalhesPreparacoes_EtapaId",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropColumn(
                name: "Cliente",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "DataFim",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "DataInicio",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "EstadoAtual",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "Observacao",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "Produto",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "StatusAtual",
                table: "Processos");

            migrationBuilder.DropColumn(
                name: "DataMovimentacao",
                table: "HistoricoMovimentacoes");

            migrationBuilder.DropColumn(
                name: "EtapaDestino",
                table: "HistoricoMovimentacoes");

            migrationBuilder.DropColumn(
                name: "EtapaOrigem",
                table: "HistoricoMovimentacoes");

            migrationBuilder.DropColumn(
                name: "Usuario",
                table: "HistoricoMovimentacoes");

            migrationBuilder.DropColumn(
                name: "DataFim",
                table: "Etapas");

            migrationBuilder.DropColumn(
                name: "DataInicio",
                table: "Etapas");

            migrationBuilder.DropColumn(
                name: "Observacao",
                table: "Etapas");

            migrationBuilder.DropColumn(
                name: "Responsavel",
                table: "Etapas");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Etapas");

            migrationBuilder.DropColumn(
                name: "TipoEtapa",
                table: "Etapas");

            migrationBuilder.DropColumn(
                name: "Altura",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropColumn(
                name: "Comprimento",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropColumn(
                name: "Espessura",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropColumn(
                name: "Largura",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropColumn(
                name: "Quantidade",
                table: "DetalhesPreparacoes");

            migrationBuilder.DropColumn(
                name: "TipoMaterial",
                table: "DetalhesPreparacoes");
        }
    }
}
