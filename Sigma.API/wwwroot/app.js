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
        if (!res.ok) throw new Error('Usuário ou senha inválidos');

        const data = await res.json();
        localStorage.setItem('token', data.token);
        alert('Login realizado com sucesso!');
        window.location.href = 'projetos.html';
    } catch (err) {
        alert(err.message);
    }
});

// --- LOGOUT ---
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// --- BUSCAR PROJETOS ---
document.getElementById('searchForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('searchNome').value.trim();
    const status = document.getElementById('searchStatus').value;

    let url = `${apiBaseUrl}/projeto/buscar?`;
    if (nome) url += `nome=${encodeURIComponent(nome)}&`;
    if (status) url += `status=${encodeURIComponent(status)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao buscar projetos');
        const projetos = await res.json();
        renderProjects(projetos);
    } catch (err) {
        alert(err.message);
    }
});

// --- RENDERIZA PROJETOS ---
function renderProjects(projetos) {
    const ul = document.getElementById('projectsList');
    ul.innerHTML = '';

    projetos.forEach(proj => {
        const li = document.createElement('li');

        // Formatando datas para exibição amigável
        const dataInicio = new Date(proj.dataInicio).toLocaleString();
        const previsaoTermino = new Date(proj.previsaoTermino).toLocaleString();

        li.textContent = `${proj.nome} - Status: ${proj.status} - Início: ${dataInicio} - Previsão Término: ${previsaoTermino}`;

        // Botão excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Você precisa estar logado para excluir.');
                return;
            }
            if (!confirm(`Confirma exclusão do projeto ${proj.nome}?`)) return;

            try {
                const res = await fetch(`${apiBaseUrl}/projeto/excluir/${proj.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: 'Bearer ' + token },
                });
                if (!res.ok) throw new Error('Erro ao excluir projeto');
                alert('Projeto excluído com sucesso!');
                document.getElementById('searchForm').dispatchEvent(new Event('submit'));
            } catch (err) {
                alert(err.message);
            }
        };

        li.appendChild(btnExcluir);
        ul.appendChild(li);
    });
}

// --- ADICIONAR PROJETO ---
document.getElementById('addProjectForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para adicionar projetos.');
        window.location.href = 'index.html';
        return;
    }

    const novoProjeto = {
        nome: document.getElementById('projectNome').value.trim(),
        descricao: document.getElementById('projectDescricao').value.trim(),
        dataInicio: new Date(document.getElementById('projectDataInicio').value).toISOString(),
        previsaoTermino: new Date(document.getElementById('projectPrevisaoTermino').value).toISOString(),
        orcamentoTotal: parseFloat(document.getElementById('projectOrcamento').value),
        classificacaoDeRisco: document.getElementById('projectClassificacaoRisco').value,
    };

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/inserir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({ model: novoProjeto }), // Envolvendo em "model"
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Erro ao adicionar projeto');
        }

        alert('Projeto adicionado com sucesso!');
        document.getElementById('addProjectForm').reset();
        document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    } catch (err) {
        alert(err.message);
    }
});

// --- ALTERAR PROJETO ---
document.getElementById('updateProjectForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para alterar projetos.');
        window.location.href = 'index.html';
        return;
    }

    const projetoAlterado = {
        id: parseInt(document.getElementById('updateProjectId').value),
        nome: document.getElementById('updateProjectNome').value.trim(),
        descricao: document.getElementById('updateProjectDescricao').value.trim(),
        dataInicio: new Date(document.getElementById('updateProjectDataInicio').value).toISOString(),
        previsaoTermino: new Date(document.getElementById('updateProjectPrevisaoTermino').value).toISOString(),
        orcamentoTotal: parseFloat(document.getElementById('updateProjectOrcamento').value),
        classificacaoDeRisco: document.getElementById('updateProjectClassificacaoRisco').value,
    };

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/alterar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({ model: projetoAlterado }), // Envolvendo em "model"
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Erro ao alterar projeto');
        }

        alert('Projeto alterado com sucesso!');
        document.getElementById('updateProjectForm').reset();
        document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    } catch (err) {
        alert(err.message);
    }
});
