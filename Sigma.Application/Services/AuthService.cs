using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Sigma.Application.Dtos;
using Sigma.Application.Interfaces;
using Sigma.Domain.Entities;
using Sigma.Domain.Interfaces.Repositories;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Sigma.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string SecretKey = "9dF#8wLq2Xz@1vRtCm$5GhYpEj7UkNbQ4ZwS";
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly PasswordHasher<Usuario> _passwordHasher = new PasswordHasher<Usuario>();

        public AuthService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<string> Authenticate(LoginDto login)
        {
            var usuario = await _usuarioRepository.BuscarPorUsername(login.Username);
            if (usuario == null)
                return null;

            var result = _passwordHasher.VerifyHashedPassword(usuario, usuario.PasswordHash, login.Password);
            if (result == PasswordVerificationResult.Failed)
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(SecretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, usuario.Username)
            }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<bool> Register(RegisterDto register)
        {
            var existingUser = await _usuarioRepository.BuscarPorUsername(register.Username);
            if (existingUser != null)
                return false;

            var usuario = new Usuario
            {
                Username = register.Username,
                Email = register.Email
            };
            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, register.Password);

            return await _usuarioRepository.Inserir(usuario);
        }
    }
}

