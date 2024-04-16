export const useRules = () => {
	return {
		required: (value: any) => !!value || 'Campo obrigatório',
		emails: (value: string[]) => {
			for (let i = 0; i < value.length; i++) {
				const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				if (!pattern.test(value[i])) return 'E-mail deve ser válido';
			}
		},
		email: (value: string) => {
			const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!value || value.length === 0) return 'E-mail é obrigatório';
			return pattern.test(value) || 'E-mail deve ser válido';
		},
		sigla: (value: string) => {
			if (!value || value.length === 0) return 'A sigla é obrigatória';
			else if (value.length > 3) return 'A sigla deve ter no máximo 3 caracteres';
		},
		nome: (value: string) => {
			if (!value || value.length === 0) return 'O nome é obrigatório';
		},
		setores: (value: string) => {
			if (!value || value.length === 0) return 'Obrigatório escolher pelo menos um setor';
		},
	};
};
