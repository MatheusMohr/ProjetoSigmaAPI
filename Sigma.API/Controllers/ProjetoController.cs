using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sigma.Application.Dtos;
using Sigma.Application.Interfaces;
using Sigma.Domain.Dtos;
using Sigma.Domain.Enums;

namespace Sigma.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjetosController : ControllerBase
    {
        private readonly IProjetoService _projetoService;

        public ProjetosController(IProjetoService projetoService)
        {
            _projetoService = projetoService;
        }

        [HttpPost]
        public async Task<IActionResult> CriarProjeto([FromBody] ProjetoNovoDto model)
        {
            var sucesso = await _projetoService.Inserir(model);
            return sucesso
                ? CreatedAtAction(nameof(ObterPorId), new { id = model.Id }, model)
                : BadRequest("Erro ao criar o projeto.");
        }


        [HttpPut("{id:long}")]
        public async Task<IActionResult> AtualizarProjeto(long id, [FromBody] ProjetosDto model)
        {
            if (id != model.Id)
                return BadRequest("ID da URL diferente do ID do corpo da requisição.");

            try
            {
                var sucesso = await _projetoService.Atualizar(model);
                return sucesso ? Ok() : NotFound("Projeto não encontrado.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao atualizar projeto: {ex.Message}");
            }
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> ExcluirProjeto(long id)
        {
            try
            {
                var sucesso = await _projetoService.Excluir(id);
                return sucesso ? NoContent() : NotFound("Projeto não encontrado ou não pode ser excluído.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao excluir projeto: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("buscar")]
        public async Task<IActionResult> Buscar([FromQuery] string? nome, [FromQuery] StatusProjeto? status)
        {
            var projetos = await _projetoService.BuscarPorFiltro(nome, status);
            return Ok(projetos);
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> BuscarTodos()
        {
            var projetos = await _projetoService.BuscarTodos();
            return Ok(projetos);
        }
        [AllowAnonymous]
        [HttpGet("{id:long}")]
        public async Task<IActionResult> ObterPorId(long id)
        {
            var projeto = await _projetoService.ObterPorId(id);
            return projeto == null
                ? NotFound("Projeto não encontrado.")
                : Ok(projeto);
        }
    }
}
