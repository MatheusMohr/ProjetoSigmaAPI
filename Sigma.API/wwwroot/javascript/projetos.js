const apiBaseUrl = 'http://localhost:5021/api';

const classificacaoRiscoEnum = {
    Baixo: "Baixo",
    Medio: "Medio",
    Alto: "Alto"
};

const statusProjetoEnum = {
    EmAnalise: "Em analise",
    AnaliseRealizada: "Analise realizada",
    AnaliseAprovada: "Analise aprovada",
    Iniciado: "Iniciado",
    Planejado: "Planejado",
    EmAndamento: "Em andamento",
    Encerrado: "Encerrado",
    Cancelado: "Cancelado"
};

function popularSelects() {
    const riscoSelect = document.getElementById('updateProjectClassificacaoRisco');
    const statusSelect = document.getElementById('updateProjectStatus');

    riscoSelect.innerHTML = '';
    statusSelect.innerHTML = '';

    Object.entries(classificacaoRiscoEnum).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        riscoSelect.appendChild(option);
    });

    Object.entries(statusProjetoEnum).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        statusSelect.appendChild(option);
    });
}

popularSelects();

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

document.getElementById('searchForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    await carregarProjetos();
});

async function carregarProjetos() {
    const id = document.getElementById('searchId')?.value.trim();
    const nome = document.getElementById('searchNome')?.value.trim();
    const status = document.getElementById('searchStatus')?.value;

    const token = localStorage.getItem('token');

    try {
        let projetos = [];

        if (id) {
            const res = await fetch(`${apiBaseUrl}/projeto/${encodeURIComponent(id)}`, {
                headers: token ? { Authorization: 'Bearer ' + token } : {}
            });

            if (res.ok) {
                const projeto = await res.json();
                projetos = [projeto];
            } else if (res.status === 404) {
                alert('Projeto nao encontrado com esse ID.');
                projetos = [];
            } else {
                const text = await res.text();
                throw new Error(text || 'Erro ao buscar projeto por ID');
            }
        } else {
            let params = [];

            if (nome) params.push(`nome=${encodeURIComponent(nome)}`);
            if (status) params.push(`status=${encodeURIComponent(status)}`);

            const url = `${apiBaseUrl}/projeto/buscar${params.length ? '?' + params.join('&') : ''}`;

            const res = await fetch(url, {
                headers: token ? { Authorization: 'Bearer ' + token } : {}
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Erro ao buscar projetos');
            }

            projetos = await res.json();

            if (projetos.length === 0) {
                alert('Nenhum projeto encontrado com esses filtros.');
            }
        }

        renderProjects(projetos);
    } catch (err) {
        alert(err.message);
    }
}

function renderProjects(projetos) {
    const ul = document.getElementById('projectsList');
    ul.innerHTML = '';

    projetos.forEach(proj => {
        const li = document.createElement('li');

        const dataInicio = new Date(proj.dataInicio).toLocaleString();
        const previsaoTermino = new Date(proj.previsaoTermino).toLocaleString();

        const riscoTexto = classificacaoRiscoEnum[proj.classificacaoRisco] || proj.classificacaoRisco;
        const statusTexto = statusProjetoEnum[proj.status] || proj.status;

        li.textContent = `ID: ${proj.id} | ${proj.nome} - Status: ${statusTexto} - Risco: ${riscoTexto} - Inicio: ${dataInicio} - Previsao Termino: ${previsaoTermino}`;

        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('btn');
        btnExcluir.onclick = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Voce precisa estar logado para excluir.');
                return;
            }
            if (!confirm(`Confirma exclusao do projeto ${proj.nome}?`)) return;

            try {
                const res = await fetch(`${apiBaseUrl}/projeto/excluir/${proj.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: 'Bearer ' + token },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Erro ao excluir projeto');
                }

                alert('Projeto excluido com sucesso!');
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

document.getElementById('addProjectForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Voce precisa estar logado para adicionar projetos.');
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

document.getElementById('updateProjectForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Voce precisa estar logado para alterar projetos.');
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

async function carregarProjetoParaAlterar(idProjeto) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Voce precisa estar logado.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/${idProjeto}`, {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Projeto nao encontrado.');
        }

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
