const apiBaseUrl = 'http://localhost:5021/api';

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
            throw new Error(text || 'Usuario ou senha invalidos');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        alert('Login realizado com sucesso!');
        window.location.href = 'projetos.html'; 
    } catch (err) {
        alert(`Erro no login: ${err.message}`);
    }
});

document.getElementById('publicSearchForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await carregarProjetosPublicos();
});

async function carregarProjetosPublicos() {
    const idRaw = document.getElementById('publicSearchId')?.value.trim();
    const id = idRaw || null;
    const nome = document.getElementById('publicSearchNome')?.value.trim();
    const status = document.getElementById('publicSearchStatus')?.value;

    const ul = document.getElementById('publicProjectsList');
    const msgDiv = document.getElementById('messageConsulta');

    ul.innerHTML = '';
    msgDiv.textContent = 'Carregando...';

    try {
        let projetos = [];

        if (id) {
            const res = await fetch(`${apiBaseUrl}/projeto/${encodeURIComponent(id)}`);
            if (res.ok) {
                const projeto = await res.json();
                projetos = [projeto];
            } else if (res.status === 404) {
                msgDiv.textContent = 'Projeto não encontrado com esse ID.';
                return;
            } else {
                const text = await res.text();
                throw new Error(text || 'Erro ao buscar projeto por ID');
            }
        } else {
            let params = [];
            if (nome) params.push(`nome=${encodeURIComponent(nome)}`);
            if (status) params.push(`status=${encodeURIComponent(status)}`);

            const url = `${apiBaseUrl}/projeto/buscar${params.length ? '?' + params.join('&') : ''}`;

            const res = await fetch(url);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Erro ao buscar projetos');
            }

            projetos = await res.json();

            if (!projetos.length) {
                msgDiv.textContent = 'Nenhum projeto encontrado.';
                return;
            }
        }

        msgDiv.textContent = '';
        projetos.forEach(proj => {
            const li = document.createElement('li');

            const dataInicio = proj.dataInicio ? new Date(proj.dataInicio).toLocaleDateString() : 'N/A';
            const previsaoTermino = proj.previsaoTermino ? new Date(proj.previsaoTermino).toLocaleDateString() : 'N/A';

            li.textContent = `ID: ${proj.id} | ${proj.nome} - Status: ${proj.status || 'Desconhecido'} - Início: ${dataInicio} - Previsão: ${previsaoTermino}`;

            ul.appendChild(li);
        });
    } catch (err) {
        msgDiv.textContent = `Erro ao carregar projetos: ${err.message}`;
    }
}