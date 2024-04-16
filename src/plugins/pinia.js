import { useAuthStore } from "~/store/auth";

export default defineNuxtPlugin(({ $pinia }) => {
	return {
		provide: {
			store: useAuthStore($pinia),
		},
	};
});
