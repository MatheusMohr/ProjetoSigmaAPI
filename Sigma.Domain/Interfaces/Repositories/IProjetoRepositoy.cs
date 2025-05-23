using Sigma.Domain.Entities;
using Sigma.Domain.Enums;

namespace Sigma.Domain.Interfaces.Repositories
{
    public interface IProjetoRepository
    {
        Task<bool> Inserir(Projeto entidade);
        Task<bool> Atualizar(Projeto entidade);
        Task<bool> Excluir(long id);
        Task<List<Projeto>> BuscarTodos();
        Task<Projeto> BuscarPorId(long id);
        Task<List<Projeto>> BuscarPorFiltro(string? nome, StatusProjeto? status);
    }
}
