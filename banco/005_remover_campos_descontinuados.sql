SET @remover_lancamento = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'imoveis'
      AND COLUMN_NAME = 'lancamento_id'
  ),
  'ALTER TABLE imoveis DROP COLUMN lancamento_id',
  'SELECT 1'
);
PREPARE comando FROM @remover_lancamento;
EXECUTE comando;
DEALLOCATE PREPARE comando;

SET @remover_unidade_area = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'imoveis'
      AND COLUMN_NAME = 'unidade_area_total'
  ),
  'ALTER TABLE imoveis DROP COLUMN unidade_area_total',
  'SELECT 1'
);
PREPARE comando FROM @remover_unidade_area;
EXECUTE comando;
DEALLOCATE PREPARE comando;
