import type { UseFetchOptions } from 'nuxt/app';

import { useAuthStore } from '../store/auth';

import { useRouter } from 'vue-router';
const router = useRouter();

interface ApiResponse {
	success: boolean;
	data: any;
	message: string;
}

export const useApi = async <T>(path: string, options?: UseFetchOptions<T>): Promise<ApiResponse> => {
	const {
		public: { apiURL: baseURL },
	} = useRuntimeConfig();

	const token = localStorage.getItem('token');

	const defaultHeaders = { Authorization: `${token}` };

	let headers = {};
	if (options?.body instanceof FormData) {
		headers = { ...defaultHeaders };
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
		headers,
		onResponse(_ctx) {},
		onResponseError(_ctx) {},
	};
	const params = { ...defaults, ...options, headers: headers, query: options?.query };

	try {
		const { logUserOut } = useAuthStore();

		const {
			data: { value },
			error,
		} = await useFetch(path, params);

		const response: ApiResponse = value as unknown as ApiResponse;

		if (error?.value?.statusCode === 401) {
			await logUserOut(router);
			return { success: false, message: 'Unauthorized', data: null };
		}

		if (!response.hasOwnProperty('success'))
			return { success: false, message: 'Erro na consulta com a api', data: null };

		if (!response.success) console.error(path, response.message);

		return response;
	} catch (error) {
		return {
			success: false,
			message: 'Erro na consulta com a api',
			data: null,
		};
	}
};
