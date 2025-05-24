using AutoMapper;
using Sigma.Application.Dtos;
using Sigma.Application.Interfaces;
using Sigma.Domain.Dtos;
using Sigma.Domain.Entities;
using Sigma.Domain.Enums;
using Sigma.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sigma.Application.Services
{
    public class ProjetoService : IProjetoService
    {
        private readonly IMapper _mapper;
        private readonly IProjetoRepository _projetoRepository;

        private readonly StatusProjeto[] StatusRestritosExclusao = new StatusProjeto[]
        {
            StatusProjeto.Iniciado,
            StatusProjeto.Planejado,
            StatusProjeto.EmAndamento,
            StatusProjeto.Encerrado
        };

        public ProjetoService(IMapper mapper, IProjetoRepository projetoRepository)
        {
            _mapper = mapper;
            _projetoRepository = projetoRepository;
        }

        public async Task<bool> Inserir(ProjetoNovoDto model)
        {
            var projeto = _mapper.Map<Projeto>(model);
            projeto.Status = StatusProjeto.EmAnalise; // status inicial padrão
            return await _projetoRepository.Inserir(projeto);
        }

        public async Task<bool> Atualizar(ProjetosDto model)
        {
            var projetoExistente = await _projetoRepository.BuscarPorId(model.Id);
            if (projetoExistente == null)
                throw new Exception("Projeto não encontrado");

            var projetoAtualizado = _mapper.Map<ProjetosDto, Projeto>(model, projetoExistente);

            return await _projetoRepository.Atualizar(projetoAtualizado);
        }

        public async Task<bool> Excluir(long id)
        {
            var projeto = await _projetoRepository.BuscarPorId(id);
            if (projeto == null)
                throw new Exception("Projeto não encontrado");

            if (Array.Exists(StatusRestritosExclusao, s => s == projeto.Status))
                throw new Exception($"Exclusão não permitida para projetos com status '{projeto.Status}'");

            return await _projetoRepository.Excluir(id);
        }

        public async Task<List<ProjetosDto>> BuscarTodos()
        {
            var projetos = await _projetoRepository.BuscarTodos();
            return _mapper.Map<List<ProjetosDto>>(projetos);
        }

        public async Task<List<ProjetosDto>> BuscarPorFiltro(string? nome, StatusProjeto? status)
        {
            var projetos = await _projetoRepository.BuscarPorFiltro(nome, status);
            return _mapper.Map<List<ProjetosDto>>(projetos);
        }

        public async Task<ProjetosDto?> ObterPorId(long id)
        {
            var entity = await _projetoRepository.BuscarPorId(id);
            if (entity == null)
                return null;

            return _mapper.Map<ProjetosDto>(entity);
        }
    }
}
