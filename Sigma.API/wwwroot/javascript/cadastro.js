const apiBaseUrl = 'http://localhost:5021/api';

const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const username = registerForm.username.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirmPassword = registerForm.confirmPassword.value;

    registerMessage.textContent = '';
    registerMessage.style.color = '';

    if (password !== confirmPassword) {
        registerMessage.textContent = 'As senhas não coincidem.';
        registerMessage.style.color = 'red';
        return;
    }

    try {
        const res = await fetch(`${apiBaseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Erro no cadastro');
        }

        registerMessage.textContent = 'Cadastro realizado com sucesso!';
        registerMessage.style.color = 'green';
        registerForm.reset();
    } catch (err) {
        registerMessage.textContent = `Erro no cadastro: ${err.message}`;
        registerMessage.style.color = 'red';
    }
});

const publicSearchForm = document.getElementById('publicSearchForm');
const messageConsulta = document.getElementById('messageConsulta');
const publicProjectsList = document.getElementById('publicProjectsList');

publicSearchForm.addEventListener('submit', async e => {
    e.preventDefault();
    await carregarProjetosPublicos();
});

async function carregarProjetosPublicos() {
    const idRaw = document.getElementById('publicSearchId')?.value.trim();
    const id = idRaw || null;
    const nome = document.getElementById('publicSearchNome')?.value.trim();
    const status = document.getElementById('publicSearchStatus')?.value;

    publicProjectsList.innerHTML = '';
    messageConsulta.textContent = 'Carregando...';

    try {
        let projetos = [];

        if (id) {
            const res = await fetch(`${apiBaseUrl}/projeto/${encodeURIComponent(id)}`);
            if (res.ok) {
                const projeto = await res.json();
                projetos = [projeto];
            } else if (res.status === 404) {
                messageConsulta.textContent = 'Projeto não encontrado com esse ID.';
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
                messageConsulta.textContent = 'Nenhum projeto encontrado.';
                return;
            }
        }

        messageConsulta.textContent = '';
        projetos.forEach(proj => {
            const li = document.createElement('li');

            const dataInicio = proj.dataInicio ? new Date(proj.dataInicio).toLocaleDateString() : 'N/A';
            const previsaoTermino = proj.previsaoTermino ? new Date(proj.previsaoTermino).toLocaleDateString() : 'N/A';

            li.textContent = `ID: ${proj.id} | ${proj.nome} - Status: ${proj.status || 'Desconhecido'} - Início: ${dataInicio} - Previsão: ${previsaoTermino}`;

            publicProjectsList.appendChild(li);
        });
    } catch (err) {
        messageConsulta.textContent = `Erro ao carregar projetos: ${err.message}`;
    }
}
