export function validaCPF(cpf: string): boolean {
	cpf = cpf.replace(/[^\d]+/g, '');

	if (cpf === '' || cpf.length !== 11) return false;
	if (/^(\d)\1+$/.test(cpf)) return false;

	let soma: number = 0;
	let resto: number;
	for (let i: number = 1; i <= 9; i++) {
		soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
	}

	resto = (soma * 10) % 11;
	if (resto === 10 || resto === 11) resto = 0;
	if (resto !== parseInt(cpf.substring(9, 10))) return false;

	soma = 0;
	for (let i: number = 1; i <= 10; i++) {
		soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
	}
	resto = (soma * 10) % 11;
	if (resto === 10 || resto === 11) resto = 0;
	if (resto !== parseInt(cpf.substring(10, 11))) return false;

	return true;
}

export function clearCpf(cpf: string): string {
	return cpf.replace(/[^\d]+/g, '');
}
