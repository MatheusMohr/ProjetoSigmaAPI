using Sigma.Domain.Enums;

namespace Sigma.Domain.Dtos
{
    public class ProjetoNovoDto
    {
        public string? Nome { get; set; }
        public string? Descricao { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime PrevisaoTermino { get; set; }
        public DateTime? DataTerminoReal { get; set; }
        public decimal OrcamentoTotal { get; set; }
        public ClassificacaoDeRisco ClassificacaoRisco { get; set; }
    }
}
