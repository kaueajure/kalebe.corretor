ALTER TABLE configuracao_manutencao
  ADD COLUMN rotulo VARCHAR(80) NOT NULL DEFAULT 'Aviso',
  ADD COLUMN titulo VARCHAR(140) NOT NULL DEFAULT 'Site em manutenção',
  ADD COLUMN mensagem_principal VARCHAR(1000) NOT NULL DEFAULT 'Estamos fazendo ajustes para melhorar sua experiência. Volte em breve.',
  ADD COLUMN mensagem_complementar VARCHAR(600) NULL DEFAULT NULL;
