using Microsoft.EntityFrameworkCore;
using Sigma.Domain.Entities;
using Sigma.Domain.Enums;
using Sigma.Domain.Interfaces.Repositories;
using Sigma.Infra.Data.Context;

namespace Sigma.Infra.Data.Repositories
{
    public class ProjetoRepository : IProjetoRepository
    {
        private readonly SigmaContext _dbContext;

        public ProjetoRepository(SigmaContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<bool> Inserir(Projeto entidade)
        {
           await _dbContext.Set<Projeto>().AddAsync(entidade);
           await _dbContext.SaveChangesAsync();
           return true;
        }

        public async Task<bool> Atualizar(Projeto entidade)
        {
            _dbContext.Set<Projeto>().Update(entidade);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Excluir(long id)
        {
            var projeto = await _dbContext.Projeto.FindAsync(id);
            if (projeto == null)
                return false;

            _dbContext.Projeto.Remove(projeto);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Projeto>> BuscarTodos()
        {
            return await _dbContext.Projeto.ToListAsync();
        }

        public async Task<Projeto> BuscarPorId(long id)
        {
            return await _dbContext.Projeto.FindAsync(id);
        }

        public async Task<List<Projeto>> BuscarPorFiltro(string? nome, StatusProjeto? status)
        {
            var query = _dbContext.Projeto.AsQueryable();

            if (!string.IsNullOrEmpty(nome))
                query = query.Where(p => p.Nome.Contains(nome));

            if (status.HasValue)
                query = query.Where(p => p.Status == status.Value);

            return await query.ToListAsync();
        }
    }
}
