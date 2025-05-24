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
    await carregarProjetos();
});

// Função para buscar e renderizar projetos
async function carregarProjetos() {
    const id = document.getElementById('searchId')?.value.trim() || '';
    const nome = document.getElementById('searchNome')?.value.trim() || '';
    const status = document.getElementById('searchStatus')?.value || '';
    let url = `${apiBaseUrl}/projeto/buscar?`;

    if (id) url += `id=${encodeURIComponent(id)}&`;
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
}

// --- RENDERIZA PROJETOS ---
function renderProjects(projetos) {
    const ul = document.getElementById('projectsList');
    ul.innerHTML = '';

    projetos.forEach(proj => {
        const li = document.createElement('li');

        const dataInicio = new Date(proj.dataInicio).toLocaleString();
        const previsaoTermino = new Date(proj.previsaoTermino).toLocaleString();

        li.textContent = `ID: ${proj.id} | ${proj.nome} - Status: ${proj.status} - Inicio: ${dataInicio} - Previsao Termino: ${previsaoTermino}`;

        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('btn');
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
                carregarProjetos();
            } catch (err) {
                alert(err.message);
            }
        };

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn');
        btnEditar.onclick = () => {
            carregarProjetoParaAlterar(proj.id);
            window.scrollTo(0, document.getElementById('updateProjectForm').offsetTop);
        };

        li.appendChild(btnExcluir);
        li.appendChild(btnEditar);
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
        classificacaoRisco: document.getElementById('projectClassificacaoRisco').value,
    };

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/inserir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify(novoProjeto),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Erro ao adicionar projeto');
        }

        alert('Projeto adicionado com sucesso!');
        e.target.reset();
        carregarProjetos();
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
        classificacaoRisco: document.getElementById('updateProjectClassificacaoRisco').value,
        status: document.getElementById('updateProjectStatus').value,
    };

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/alterar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify(projetoAlterado),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Erro ao alterar projeto');
        }

        alert('Projeto alterado com sucesso!');
        e.target.reset();
        carregarProjetos();
    } catch (err) {
        alert(err.message);
    }
});

// --- CARREGAR PROJETO PARA ALTERAÇÃO ---
async function carregarProjetoParaAlterar(idProjeto) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/${idProjeto}`, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });

        if (!res.ok) throw new Error('Projeto não encontrado.');
        const proj = await res.json(); 

        document.getElementById('updateProjectId').value = proj.id;
        document.getElementById('updateProjectNome').value = proj.nome;
        document.getElementById('updateProjectDescricao').value = proj.descricao;
        document.getElementById('updateProjectDataInicio').value = proj.dataInicio ? proj.dataInicio.substring(0, 16) : '';
        document.getElementById('updateProjectPrevisaoTermino').value = proj.previsaoTermino ? proj.previsaoTermino.substring(0, 16) : '';
        document.getElementById('updateProjectOrcamento').value = proj.orcamentoTotal || '';
        document.getElementById('updateProjectClassificacaoRisco').value = proj.classificacaoRisco || '';
        document.getElementById('updateProjectStatus').value = proj.status || '';
    } catch (err) {
        alert(err.message);
    }
}

// --- Inicializa a lista de projetos ao carregar a página, se o elemento existir ---
if (document.getElementById('projectsList')) {
    carregarProjetos();
}
