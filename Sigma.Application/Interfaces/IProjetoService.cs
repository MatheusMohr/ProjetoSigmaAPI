﻿using Sigma.Application.Dtos;
using Sigma.Domain.Dtos;
using Sigma.Domain.Entities;
using Sigma.Domain.Enums;

namespace Sigma.Application.Interfaces
{
    public interface IProjetoService
    {
        Task<bool> Inserir(ProjetoNovoDto model);
        Task<bool> Excluir(long id);
        Task<bool> Atualizar(ProjetosDto model);
        Task<List<ProjetosDto>> BuscarTodos();
        Task<List<ProjetosDto>> BuscarPorFiltro(string? nome, StatusProjeto? status);
        Task<ProjetosDto> ObterPorId(long id);
    }
}
