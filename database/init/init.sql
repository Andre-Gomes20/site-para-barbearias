-- =============================================
-- SISTEMA DE BARBEARIAS - Script de Inicialização
-- PostgreSQL (alinhado ao README / diagrama ER)
-- =============================================

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELAS
-- =============================================

-- EMPRESA
CREATE TABLE IF NOT EXISTS empresa (
    id SERIAL PRIMARY KEY,
    cod_empresa VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USUARIO
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(11) UNIQUE, -- obrigatório para BARBEIRO (apenas dígitos); null para CLIENTE/ADMIN
    tipo_usuario VARCHAR(20) NOT NULL
        CHECK (tipo_usuario IN ('CLIENTE', 'BARBEIRO', 'ADMIN_BARBEARIA')),
    status VARCHAR(20) DEFAULT 'PENDING_APPROVAL'
        CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    id_empresa INTEGER REFERENCES empresa(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_empresa CHECK (
        tipo_usuario = 'CLIENTE'
        OR (tipo_usuario IN ('BARBEIRO', 'ADMIN_BARBEARIA') AND id_empresa IS NOT NULL)
    ),
    CONSTRAINT chk_usuario_cpf_barbeiro CHECK (
        tipo_usuario <> 'BARBEIRO' OR cpf IS NOT NULL
    )
);

-- OAUTHACCOUNT
CREATE TABLE IF NOT EXISTS oauth_account (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- SERVICO
CREATE TABLE IF NOT EXISTS servico (
    id SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AGENDAMENTO
CREATE TABLE IF NOT EXISTS agendamento (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    id_barbeiro INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    id_servico INTEGER NOT NULL REFERENCES servico(id) ON DELETE RESTRICT,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'NO_SHOW')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (data_hora_fim > data_hora_inicio)
);

-- HORARIOTRABALHO
CREATE TABLE IF NOT EXISTS horario_trabalho (
    id SERIAL PRIMARY KEY,
    id_barbeiro INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT true,
    CHECK (hora_fim > hora_inicio)
);

-- PAGAMENTO
CREATE TABLE IF NOT EXISTS pagamento (
    id SERIAL PRIMARY KEY,
    id_agendamento INTEGER NOT NULL REFERENCES agendamento(id) ON DELETE RESTRICT,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('PIX', 'DINHEIRO', 'CARTAO')),
    status VARCHAR(20) DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO')),
    data_pagamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AVALIACAO
CREATE TABLE IF NOT EXISTS avaliacao (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    id_barbeiro INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    id_agendamento INTEGER REFERENCES agendamento(id) ON DELETE SET NULL,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PORTFOLIO
CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    id_barbeiro INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    foto_url TEXT NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICACAO
CREATE TABLE IF NOT EXISTS notificacao (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_usuario_cpf ON usuario(cpf);
CREATE INDEX IF NOT EXISTS idx_usuario_empresa ON usuario(id_empresa);
CREATE INDEX IF NOT EXISTS idx_agendamento_data ON agendamento(data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamento_barbeiro ON agendamento(id_barbeiro, data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_servico_empresa ON servico(id_empresa);
CREATE INDEX IF NOT EXISTS idx_pagamento_agendamento ON pagamento(id_agendamento);
CREATE INDEX IF NOT EXISTS idx_avaliacao_barbeiro ON avaliacao(id_barbeiro);
CREATE INDEX IF NOT EXISTS idx_portfolio_barbeiro ON portfolio(id_barbeiro);
CREATE INDEX IF NOT EXISTS idx_notificacao_usuario ON notificacao(id_usuario);

-- =============================================
-- SEED DATA BÁSICO (exemplo)
-- =============================================
INSERT INTO empresa (cod_empresa, nome, cnpj, endereco, telefone, email)
VALUES (
    'BARB001',
    'Barbearia Exemplo',
    '12.345.678/0001-99',
    'Rua das Flores, 123',
    '(11) 99999-9999',
    'contato@barbearia.com'
)
ON CONFLICT (cod_empresa) DO NOTHING;

-- Admin da barbearia (senha: admin123 — substituir pelo hash BCrypt real na aplicação)
INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario, status, id_empresa)
VALUES (
    'Administrador',
    'admin@barbearia.com',
    '$2a$10$examplehash1234567890abcdef',
    '(11) 98888-8888',
    'ADMIN_BARBEARIA',
    'ACTIVE',
    1
)
ON CONFLICT (email) DO NOTHING;

-- Barbeiro de exemplo (CPF de exemplo válido apenas para seed)
INSERT INTO usuario (nome, email, senha, telefone, cpf, tipo_usuario, status, id_empresa)
VALUES (
    'João Barbeiro',
    'joao@barbearia.com',
    '$2a$10$examplehash1234567890abcdef',
    '(11) 97777-7777',
    '52998224725',
    'BARBEIRO',
    'ACTIVE',
    1
)
ON CONFLICT (email) DO NOTHING;

-- Cliente de exemplo (sem vínculo com empresa)
INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario, status, id_empresa)
VALUES (
    'Pedro Cliente',
    'pedro@email.com',
    '$2a$10$examplehash1234567890abcdef',
    '(11) 96666-6666',
    'CLIENTE',
    'ACTIVE',
    NULL
)
ON CONFLICT (email) DO NOTHING;

-- Serviços iniciais
INSERT INTO servico (id_empresa, nome, duracao_minutos, preco, descricao)
VALUES
    (1, 'Corte de Cabelo', 30, 45.00, 'Corte clássico ou moderno'),
    (1, 'Barba', 20, 35.00, 'Barba completa'),
    (1, 'Corte + Barba', 50, 70.00, 'Combo completo');

-- Horário de trabalho do barbeiro (segunda a sexta, 09:00–18:00)
INSERT INTO horario_trabalho (id_barbeiro, dia_semana, hora_inicio, hora_fim)
SELECT u.id, d.dia, '09:00', '18:00'
FROM usuario u
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(dia)
WHERE u.email = 'joao@barbearia.com';