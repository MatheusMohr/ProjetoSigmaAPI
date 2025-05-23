using Sigma.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sigma.Application.Dtos
{
    public class ProjetoUpdateDto
    {
        public long Id { get; set; }
        public string? Nome { get; set; }
        public string? Descricao { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime PrevisaoTermino { get; set; }
        public DateTime? DataTerminoReal { get; set; }
        public decimal OrcamentoTotal { get; set; }
        public ClassificaçãoDeRisco ClassificacaoRisco { get; set; }
        public StatusProjeto Status { get; set; }
    }
}
