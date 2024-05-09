import type { UseFetchOptions } from 'nuxt/app';

import { useAuthStore } from '../store/auth';


interface ApiResponse {
	success: boolean;
	data: any;
	message: string;
}

export const useApi = async <T>(path: string, options?: any): Promise<ApiResponse> => {

	const {
		public: { apiURL: baseURL },
	} = useRuntimeConfig();

	const token = localStorage.getItem('token');

	const defaultHeaders = { Authorization: `${token}` };

	let headers = {};
	if (options?.body instanceof FormData) {
		headers = { 
			...defaultHeaders,
		};
	} else {
		headers = {
			'Content-Type': 'application/json',
			...defaultHeaders,
		};
	}

	const defaults: UseFetchOptions<T> = {
		baseURL: baseURL as string,
		key: path.toString(),
		watch: false,
		lazy: true,
		headers,
		onResponse(_ctx) {},
		onResponseError(_ctx) {},
	};
	const params = { ...defaults, ...options, headers: headers, query: options?.query };

	const { logUserOut } = useAuthStore();
	try {

		const data = await $fetch(path, {
			baseURL: baseURL,
			headers,
			...options?.method && {
				method: options.method
			},
			...options?.body && {
				body: options.body
			},
			query: params.query,
		});

		const response: ApiResponse = data as unknown as ApiResponse;

		if (!response.hasOwnProperty('success'))
			return { success: false, message: 'Erro na consulta com a api', data: null };

		if (!response.success) console.error(path, response.message);

		return response;
	} 
	catch (error) {
		if (error?.value?.statusCode === 401) {
			await logUserOut();
			return { success: false, message: 'Unauthorized', data: null };
		}
		return {
			success: false,
			message: 'Erro na consulta com a api',
			data: null,
		};
	}
};
