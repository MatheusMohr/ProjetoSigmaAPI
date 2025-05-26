using Sigma.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sigma.Domain.Interfaces.Repositories
{
    public interface IUsuarioRepository
    {
        Task<bool> Inserir(Usuario usuario);
        Task<Usuario?> BuscarPorUsername(string username);
    }
}
