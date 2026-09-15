export function validarSenhaNova(senha: string) {
  if (senha.length < 10) return "A senha deve ter pelo menos 10 caracteres.";
  if (new TextEncoder().encode(senha).length > 72) {
    return "A senha deve ter no máximo 72 bytes.";
  }
  if (!/[a-zá-ú]/i.test(senha) || !/\d/.test(senha)) {
    return "Use pelo menos uma letra e um número.";
  }
  return null;
}
