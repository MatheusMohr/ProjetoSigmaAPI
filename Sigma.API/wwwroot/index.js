const apiBaseUrl = 'http://localhost:5021/api';

// --- LOGIN ---
document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();

    try {
        const res = await fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Usuário ou senha inválidos');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        alert('Login realizado com sucesso!');
        window.location.href = 'projetos.html'; // redireciona após login
    } catch (err) {
        alert(`Erro no login: ${err.message}`);
    }
});

// --- BUSCAR PROJETOS PÚBLICOS ---
document.getElementById('publicSearchForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await carregarProjetosPublicos();
});

async function carregarProjetosPublicos() {
    const id = document.getElementById('publicSearchId')?.value.trim() || '';
    const nome = document.getElementById('publicSearchNome')?.value.trim() || '';
    const status = document.getElementById('publicSearchStatus')?.value || '';

    let url = `${apiBaseUrl}/projeto/buscar?`;

    if (id) url += `id=${encodeURIComponent(id)}&`;
    if (nome) url += `nome=${encodeURIComponent(nome)}&`;
    if (status) url += `status=${encodeURIComponent(status)}`;

    // Remove trailing '&' ou '?' se houver
    url = url.replace(/[&?]$/, '');

    const ul = document.getElementById('publicProjectsList');
    const msgDiv = document.getElementById('messageConsulta');

    ul.innerHTML = '';
    msgDiv.textContent = 'Carregando...';

    try {
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Erro ao buscar projetos');
        }

        const projetos = await res.json();

        if (!projetos.length) {
            msgDiv.textContent = 'Nenhum projeto encontrado.';
            return;
        }

        msgDiv.textContent = ''; // limpa mensagem

        projetos.forEach(proj => {
            const li = document.createElement('li');

            const dataInicio = proj.dataInicio ? new Date(proj.dataInicio).toLocaleDateString() : 'N/A';
            const previsaoTermino = proj.previsaoTermino ? new Date(proj.previsaoTermino).toLocaleDateString() : 'N/A';

            li.textContent = `ID: ${proj.id} | ${proj.nome} - Status: ${proj.status || 'Desconhecido'} - Inicio: ${dataInicio} - Previsao: ${previsaoTermino}`;

            ul.appendChild(li);
        });

    } catch (err) {
        msgDiv.textContent = `Erro ao carregar projetos: ${err.message}`;
    }
}
