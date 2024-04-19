export function validaCNPJ(cnpj: string): boolean {
	cnpj = cnpj.replace(/[^\d]+/g, '');

	if (cnpj === '' || cnpj.length !== 14) return false;

	if (/^(\d)\1+$/.test(cnpj)) return false;

	let tamanho: number = cnpj.length - 2;
	let numeros: string = cnpj.substring(0, tamanho);
	let digitos: string = cnpj.substring(tamanho);
	let soma: number = 0;
	let pos: number = tamanho - 7;

	for (let i: number = tamanho; i >= 1; i--) {
		soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
		if (pos < 2) pos = 9;
	}

	let resultado: number = soma % 11 < 2 ? 0 : 11 - (soma % 11);
	if (resultado != parseInt(digitos.charAt(0))) return false;

	tamanho = tamanho + 1;
	numeros = cnpj.substring(0, tamanho);
	soma = 0;
	pos = tamanho - 7;
	for (let i: number = tamanho; i >= 1; i--) {
		soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
		if (pos < 2) pos = 9;
	}
	resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
	if (resultado != parseInt(digitos.charAt(1))) return false;

	return true;
}

export function clearCnpj(cnpj: string): string {
	return cnpj.replace(/[^\d]+/g, '');
}
