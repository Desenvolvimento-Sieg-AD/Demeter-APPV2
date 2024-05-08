export const useRules = () => {
	return {
		required: (v: any) => v instanceof Array && !v.length ? "Campo obrigatório" : !!v || "Campo obrigatório",
		default: (value: any) => true,
		text: (value: any) => true,
		boleto: (value: any) => true,
		number: (value: any) => {
			const pattern = /\d*/
			return pattern.test(value) || 'Valor inválido'
		},
		percent: (value: any) => {
			if(!value) return true;
			const pattern = /\d%?/g
			return pattern.test(value) || 'Valor de porcentagem inválido'
		},
		email: (value: string) => {
			if (!value || value.length === 0) return true;
			const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(!Array.isArray(value)) {
				return pattern.test(value) || 'E-mail deve ser válido';
			}
			for (let i = 0; i < value.length; i++) {
				return pattern.test(value[i]) || 'E-mail deve ser válido';
			}
			return true;
		},
		overZero: (value: string) => {
			if(value == null || value == undefined) return true
			value = value.replace(/\D/g, '')
			return !!parseFloat(value) || "Obrigatório preencher um valor acima de zero"
			
		},
		sigla: (value: string) => {
			if(value == null || value == undefined) return true
			return value.length > 3 || 'A sigla deve ter no máximo 3 caracteres';
		},
		nome: (value: string) => {
			return true
		},
		cnpj: (value: string) => {
			if(!value) return true
			value = value?.replace(/[^\d]+/g, '') ?? '';
			
			if(value === '') return true
			if (value.length !== 14) return 'CNPJ Inválido';
			if (/^(\d)\1+$/.test(value)) return 'CNPJ Inválido'
		  
			let tamanho: number = value.length - 2;
			let numeros: string = value.substring(0, tamanho);
			let digitos: string = value.substring(tamanho);
			let soma: number = 0;
			let pos: number = tamanho - 7;
		  
			for (let i: number = tamanho; i >= 1; i--) {
			  soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
			  if (pos < 2) pos = 9;
			}
		  
			let resultado: number = soma % 11 < 2 ? 0 : 11 - soma % 11;
			if (resultado != parseInt(digitos.charAt(0))) return 'CNPJ Inválido';
		  
			tamanho = tamanho + 1;
			numeros = value.substring(0, tamanho);
			soma = 0;
			pos = tamanho - 7;
			for (let i: number = tamanho; i >= 1; i--) {
			  soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
			  if (pos < 2) pos = 9;
			}
			resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
			if (resultado != parseInt(digitos.charAt(1))) return 'CNPJ Inválido';
		  
			return true;
		},
		setores: (value: string) => {
			// if (!value || value.length === 0) return 'Obrigatório escolher pelo menos um setor';
			return true;
		}		
	};
};
