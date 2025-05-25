using AutoMapper;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Sigma.Domain.Enums;
using Sigma.Infra.CrossCutting.IoC;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text.Json.Serialization;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Adiciona contexto do banco (EF)
builder.Services.AddApplicationContext(configuration.GetValue<string>("ConnectionStrings:Database")!);

// Configuração do AutoMapper
MapperConfiguration mapperConfiguration = new MapperConfiguration(mapperConfig =>
{
    mapperConfig.AddMaps(new[] { "Sigma.Application" });
});
builder.Services.AddSingleton(mapperConfiguration.CreateMapper());

// Registra os serviços e repositórios da aplicação
ContainerService.AddApplicationServicesCollentions(builder.Services);

// Configuração do CORS para permitir qualquer origem (ajuste para produção)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configuração do JWT - substitua a chave pela sua segura!
var key = Encoding.ASCII.GetBytes("chave_super_secreta_com_mais_32_bytes!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // para ambiente de desenvolvimento
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseDefaultFiles();
app.UseStaticFiles();

// Use CORS antes da autenticação e autorização
app.UseCors("AllowAllOrigins");

app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Type", "application/json; charset=utf-8");
    await next.Invoke();
});

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
