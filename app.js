const apiBaseUrl = 'http://localhost:5021/api'; // Ajuste para sua URL backend

// ===== LOGIN =====
document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

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

// ===== LOGOUT =====
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// ===== CARREGAR PROJETOS PÚBLICOS =====
document.getElementById('loadProjectsBtn')?.addEventListener('click', async () => {
    try {
        const res = await fetch(`${apiBaseUrl}/projeto/buscar`);
        if (!res.ok) throw new Error('Erro ao carregar projetos');
        const projetos = await res.json();

        const ul = document.getElementById('projectsList');
        ul.innerHTML = '';

        projetos.forEach(proj => {
            const li = document.createElement('li');
            li.textContent = `${proj.nome} - Status: ${proj.status}`;
            ul.appendChild(li);
        });
    } catch (err) {
        alert(err.message);
    }
});

// ===== ADICIONAR PROJETO (PROTEGIDO) =====
document.getElementById('addProjectForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para adicionar projetos.');
        window.location.href = 'index.html';
        return;
    }

    const nome = document.getElementById('projectName').value.trim();
    const descricao = document.getElementById('projectDescription').value.trim();

    // Montar objeto básico, adapte conforme seu DTO!
    const novoProjeto = {
        nome,
        descricao
        // Adicione outros campos obrigatórios aqui
    };

    try {
        const res = await fetch(`${apiBaseUrl}/projeto/inserir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(novoProjeto)
        });

        if (!res.ok) throw new Error('Erro ao adicionar projeto');

        alert('Projeto adicionado com sucesso!');
        document.getElementById('addProjectForm').reset();
    } catch (err) {
        alert(err.message);
    }
});
