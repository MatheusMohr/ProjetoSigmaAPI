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
    public class ProjetoController : ControllerBase
    {
        private readonly IProjetoService _projetoService;

        public ProjetoController(IProjetoService projetoService)
        {
            _projetoService = projetoService;
        }

        [HttpPost("inserir")]
        public async Task<IActionResult> Inserir([FromBody] ProjetoNovoDto model)
        {
            var result = await _projetoService.Inserir(model);
            return result ? Ok() : BadRequest();
        }

        [HttpPut("alterar")]
        public async Task<IActionResult> Alterar([FromBody] ProjetosDto model)
        {
            try
            {
                var result = await _projetoService.Atualizar(model);
                return result ? Ok() : BadRequest();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("excluir/{id:long}")]
        public async Task<IActionResult> Excluir(long id)
        {
            try
            {
                var result = await _projetoService.Excluir(id);
                return result ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> Buscar([FromQuery] string? nome, [FromQuery] StatusProjeto? status)
        {
            var projetos = await _projetoService.BuscarPorFiltro(nome, status);
            return Ok(projetos);
        }

        [HttpGet]
        public async Task<IActionResult> BuscarTodos()
        {
            var projetos = await _projetoService.BuscarTodos();
            return Ok(projetos);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> ObterPorId(long id)
        {
            var projeto = await _projetoService.ObterPorId(id);
            if (projeto == null)
                return NotFound("Projeto não encontrado");
            return Ok(projeto);
        }
    }

}