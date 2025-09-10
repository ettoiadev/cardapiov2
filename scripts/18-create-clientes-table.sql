-- Script para criar tabela de clientes com campos necessários para cadastro completo
-- Execute este script no Supabase para criar a estrutura de clientes

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  cep VARCHAR(10) NOT NULL,
  endereco_completo TEXT NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_cep ON clientes(cep);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON clientes(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
-- Permitir inserção pública (para cadastro no checkout)
CREATE POLICY "Public insert clientes" ON clientes 
  FOR INSERT 
  WITH CHECK (true);

-- Permitir leitura apenas para admins autenticados
CREATE POLICY "Admin read clientes" ON clientes 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Permitir atualização apenas para admins autenticados
CREATE POLICY "Admin update clientes" ON clientes 
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir exclusão apenas para admins autenticados
CREATE POLICY "Admin delete clientes" ON clientes 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE clientes IS 'Tabela de clientes cadastrados no sistema';
COMMENT ON COLUMN clientes.id IS 'Identificador único do cliente';
COMMENT ON COLUMN clientes.nome_completo IS 'Nome completo do cliente';
COMMENT ON COLUMN clientes.telefone IS 'Número de telefone do cliente';
COMMENT ON COLUMN clientes.cep IS 'CEP do endereço do cliente';
COMMENT ON COLUMN clientes.endereco_completo IS 'Endereço completo obtido via API ViaCEP';
COMMENT ON COLUMN clientes.numero IS 'Número da residência/estabelecimento';
COMMENT ON COLUMN clientes.complemento IS 'Complemento do endereço (opcional)';
COMMENT ON COLUMN clientes.ativo IS 'Indica se o cliente está ativo no sistema';
COMMENT ON COLUMN clientes.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN clientes.updated_at IS 'Data e hora da última atualização';

-- Verificar se a tabela foi criada com sucesso
SELECT 
  'Tabela clientes criada com sucesso!' as status,
  COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public';