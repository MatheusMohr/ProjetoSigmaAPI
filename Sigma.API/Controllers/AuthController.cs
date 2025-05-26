using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sigma.Application.Dtos;
using Sigma.Application.Interfaces;
using System.Threading.Tasks;

namespace Sigma.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var token = await _authService.Authenticate(login);
            if (token == null)
                return Unauthorized();

            return Ok(new { Token = token });
        }

    [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto register)
        {
            var result = await _authService.Register(register);
            if (!result)
                return BadRequest("Usu�rio j� existe.");

            return Ok("Usu�rio registrado com sucesso.");
        }
    }
}
