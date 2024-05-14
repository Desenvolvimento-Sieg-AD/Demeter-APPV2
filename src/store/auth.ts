import { defineStore } from 'pinia';

interface AuthUser {
	id: number;
	nome: string;
	sigla: string;
	email: string;
	tipo: {
		id: number;
		nome: string;
	};
	setores: [
		{ id: number; nome: string; exibe_projetos: boolean; sigla: string; }
	];
}

export const useAuthStore = defineStore('auth', {
	state: () => ({
		authenticated: localStorage.getItem('token') ? true : false,
		loading: false,
		user: null as AuthUser | null,
		token: null as string | null,
	}),
	persist: {
		storage: persistedState.localStorage,
		paths: ['authenticated', 'user', 'token'],
	},
	getters: {
		isAuthenticated(state) {
			return state.authenticated;
		},
		isAdmin(state) {
			return state.user?.tipo?.id === 1;
		},
		isGerente(state) {
			return state.user?.tipo?.id === 2;
		},
		isFinanceiro(state) {
			return state.user?.tipo?.id === 4;
		},
		isCompras(state) {
			return state.user?.tipo?.id === 5;
		}
	},
	actions: {
		async authenticateUser(sigla: string) {
			try {
				// await this.checkAPI();

				const { data, success, message } = await useApi('/auth', {
					method: 'POST',
					body: { sigla }
				});
				if (!success) throw new Error(message);

				this.user = data.user;
				this.token = data.token;

				localStorage.setItem('token', data.token);

				this.authenticated = true;

				return { success: true, user: data.user };
			}
			catch (error) {
				return { success: false, message: error.message };
			}
		},

		async logUserOut() {
			const router = useRouter();

			this.user = null;
			this.authenticated = false;

			this.$reset();
			router.push('/login');
		},

		async checkAPI() {
			try {
				const { success } = await useApi('/status');
				if (!success) throw new Error('API indisponível, entre em contato com o Desenvolvimento');
			}
			catch (error) {
				throw new Error(error.message);
			}
		}
	},
});
