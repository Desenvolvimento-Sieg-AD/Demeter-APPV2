import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
	state: () => ({
		authenticated: localStorage.getItem('token') ? true : false,
		loading: false,
		user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
		token: localStorage.getItem('token') || null,
	}),
	actions: {
		setToken(token: string | null) {
			this.token = token;
		},
		async authenticateUser(sigla: string) {
			try {
				// await this.checkAPI();

				const { data, success, message } = await useApi('/auth', {
					method: 'POST',
					body: {
						sigla,
					},
				});

				if (success) {
					localStorage.clear();
					const expirationDate = new Date();
					expirationDate.setDate(expirationDate.getDate() + 30);
					localStorage.setItem('token', data.token);
					localStorage.setItem('tokenExpiration', expirationDate.toString());
					localStorage.setItem('user', JSON.stringify(data.user));
					this.authenticated = true;

					return {
						success: true,
						user: { ...data.user }
					};
				}
				else {
					throw new Error(message);
				}
			}
			catch (error: any) {
				return {
					success: false,
					message: error.message,
				};
			}
		},

		async logUserOut() {
			const router = useRouter();
			localStorage.clear();

			this.user = null;
			this.authenticated = false;
			this.$reset();
			router.push('/login');
		},

		async checkAPI() {
			try {
				const { success } = await useApi('/status');
				if (!success) throw new Error('API não disponível');
			}
			catch (error: any) {
				console.log(error.message);
				throw new Error('API indisponível, entre em contato com o Desenvolvimento');
			}
		}
	},
});
