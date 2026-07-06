-- =============================================
-- SISTEMA DE BARBEARIAS - Script de Inicialização
-- PostgreSQL
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USUARIO
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('ADMIN', 'BARBEIRO', 'CLIENTE')),
    status VARCHAR(20) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO', 'BLOQUEADO')),
    id_empresa INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAUTHACCOUNT
CREATE TABLE IF NOT EXISTS oauth_account (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, facebook, etc.
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
    preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (hora_fim > hora_inicio)
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_empresa ON usuario(id_empresa);
CREATE INDEX idx_agendamento_data ON agendamento(data_hora_inicio);
CREATE INDEX idx_agendamento_barbeiro ON agendamento(id_barbeiro, data_hora_inicio);
CREATE INDEX idx_servico_empresa ON servico(id_empresa);

-- =============================================
-- SEED DATA BÁSICO (exemplo)
-- =============================================
INSERT INTO empresa (cod_empresa, nome, cnpj, endereco, telefone, email)
VALUES ('BARB001', 'Barbearia Exemplo', '12.345.678/0001-99', 'Rua das Flores, 123', '(11) 99999-9999', 'contato@barbearia.com')
ON CONFLICT DO NOTHING;

-- Usuário admin (senha: admin123 - usar BCrypt na aplicação!)
INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario, id_empresa)
VALUES ('Administrador', 'admin@barbearia.com', '$2a$10$examplehash1234567890abcdef', '(11) 98888-8888', 'ADMIN', 1)
ON CONFLICT DO NOTHING;

-- Serviços iniciais
INSERT INTO servico (id_empresa, nome, duracao_minutos, preco, descricao)
VALUES 
    (1, 'Corte de Cabelo', 30, 45.00, 'Corte clássico ou moderno'),
    (1, 'Barba', 25, 35.00, 'Barba completa'),
    (1, 'Corte + Barba', 55, 70.00, 'Combo completo')
ON CONFLICT DO NOTHING;