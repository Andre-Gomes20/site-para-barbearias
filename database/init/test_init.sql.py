import psycopg2
from psycopg2 import sql
import sys

# ================== CONFIGURAÇÃO ==================
DB_CONFIG = {
    'dbname': 'barbearia_test',
    'user': 'postgres',      # ← ALTERE AQUI
    'password': 'postgres',  # ← ALTERE AQUI
    'host': 'localhost',
    'port': '5432'
}
# =================================================

def conectar():
    return psycopg2.connect(**DB_CONFIG)

def criar_banco_teste():
    """Cria o banco de teste"""
    conn = psycopg2.connect(
        dbname='postgres',
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port']
    )
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_CONFIG['dbname'])))
        print("✅ Banco de teste criado!")
    except psycopg2.errors.DuplicateDatabase:
        print("ℹ️  Banco já existe.")
    finally:
        cur.close()
        conn.close()

def executar_init():
    """Executa o seu arquivo init.sql"""
    conn = conectar()
    cur = conn.cursor()
    
    try:
        with open('init.sql', 'r', encoding='utf-8') as f:
            script = f.read()
        
        cur.execute(script)
        conn.commit()
        print("✅ init.sql executado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao executar init.sql: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

def rodar_testes():
    """Testes de validação"""
    conn = conectar()
    cur = conn.cursor()
    
    testes = [
        ("SELECT COUNT(*) FROM empresa;", "Empresas cadastradas"),
        ("SELECT COUNT(*) FROM usuario;", "Usuários cadastrados"),
        ("SELECT COUNT(*) FROM servico;", "Serviços cadastrados"),
        ("SELECT nome, tipo_usuario, status FROM usuario WHERE email = 'admin@barbearia.com';", "Usuário Admin"),
        ("SELECT nome, duracao_minutos, preco FROM servico ORDER BY preco;", "Serviços disponíveis"),
        ("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';", "Tabelas criadas"),
    ]
    
    print("\n" + "="*50)
    print("🔍 EXECUTANDO TESTES DE VALIDAÇÃO")
    print("="*50)
    
    for query, descricao in testes:
        try:
            cur.execute(query)
            resultados = cur.fetchall()
            print(f"\n✅ {descricao}:")
            for linha in resultados:
                print(f"   → {linha}")
        except Exception as e:
            print(f"❌ Falha no teste '{descricao}': {e}")
    
    cur.close()
    conn.close()

# ================== EXECUÇÃO ==================
if __name__ == "__main__":
    print("🚀 Iniciando Teste do init.sql - Sistema de Barbearia\n")
    
    criar_banco_teste()
    executar_init()
    rodar_testes()
    
    print("\n🎉 Teste finalizado! Verifique se apareceu algum erro acima.")