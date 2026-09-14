CREATE TABLE IF NOT EXISTS caracteristicas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  imovel_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY caracteristicas_imovel_nome (imovel_id, nome),
  CONSTRAINT caracteristicas_imovel_fk FOREIGN KEY (imovel_id)
    REFERENCES imoveis (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
